#!/usr/bin/env Rscript

# Load required libraries
library(jsonlite)
library(metafor)
library(dplyr)
library(purrr)

# Function to run sensitivity analysis
run_sensitivity_analysis <- function(data, model_type = "RE", effect_measure = "OR", method = "REML") {
  # First, run the baseline analysis
  baseline_results <- run_baseline_analysis(data, model_type, effect_measure, method)
  
  # Then, run leave-one-out analysis
  leave_one_out_results <- run_leave_one_out(data, model_type, effect_measure, method)
  
  # Return combined results
  return(list(
    baseline = baseline_results,
    leaveOneOut = leave_one_out_results
  ))
}

# Function to run baseline analysis
run_baseline_analysis <- function(data, model_type, effect_measure, method) {
  # Determine the appropriate yi (effect size) and vi (variance) variables
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (effect_measure %in% c("OR", "RR")) {
      # For ratio measures, we work on the log scale
      yi <- log(data$effect_size)
      vi <- data$se^2
    } else {
      yi <- data$effect_size
      vi <- data$se^2
    }
  } else {
    stop("Data must contain effect_size and se columns")
  }
  
  # Run the meta-analysis
  if (model_type == "FE") {
    model <- metafor::rma(yi = yi, vi = vi, method = "FE")
  } else {
    model <- metafor::rma(yi = yi, vi = vi, method = method)
  }
  
  # Create a results object with key statistics
  results <- list(
    overallEffect = if (effect_measure %in% c("OR", "RR")) exp(model$b) else model$b,
    ciLower = if (effect_measure %in% c("OR", "RR")) exp(model$ci.lb) else model$ci.lb,
    ciUpper = if (effect_measure %in% c("OR", "RR")) exp(model$ci.ub) else model$ci.ub,
    pValue = model$pval,
    heterogeneity = list(
      iSquared = model$I2,
      tauSquared = model$tau2,
      hSquared = model$H2,
      qStatistic = model$QE,
      qDf = model$k - 1,
      qPvalue = model$QEp
    )
  )
  
  return(results)
}

# Function to run leave-one-out analysis
run_leave_one_out <- function(data, model_type, effect_measure, method) {
  n_studies <- nrow(data)
  leave_one_out_results <- list()
  
  for (i in 1:n_studies) {
    # Create subset without the current study
    subset_data <- data[-i, ]
    
    # Run analysis on subset
    subset_results <- run_baseline_analysis(subset_data, model_type, effect_measure, method)
    
    # Add study information
    leave_one_out_results[[i]] <- list(
      studyId = data$study_id[i],
      studyLabel = data$study_label[i],
      results = subset_results
    )
  }
  
  return(leave_one_out_results)
}

# Main execution
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript sensitivity_analysis.R <data_file> <parameters_json>")
}

# Read data and parameters
data_file <- args[1]
parameters_json <- args[2]

# Load data
data <- fromJSON(data_file)
parameters <- fromJSON(parameters_json)

# Extract parameters
model_type <- parameters$modelType
effect_measure <- parameters$effectMeasure
method <- parameters$method

# Run analysis
results <- run_sensitivity_analysis(data, model_type, effect_measure, method)

# Output results as JSON
cat(toJSON(results, auto_unbox = TRUE)) 