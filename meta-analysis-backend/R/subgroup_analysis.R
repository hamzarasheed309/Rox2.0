#!/usr/bin/env Rscript

# Load required libraries
library(jsonlite)
library(metafor)
library(dplyr)

# Function to run subgroup analysis
run_subgroup_analysis <- function(data, subgroup_var, model_type = "RE", effect_measure = "OR", method = "REML") {
  if (!subgroup_var %in% names(data)) {
    stop("Subgroup variable not found in data")
  }
  
  # Split data by subgroup
  subgroups <- unique(data[[subgroup_var]])
  subgroup_results <- list()
  
  for (group in subgroups) {
    subgroup_data <- data %>% filter(!!sym(subgroup_var) == group)
    if (nrow(subgroup_data) > 0) {
      # Determine the appropriate yi (effect size) and vi (variance) variables
      if ("log_effect_size" %in% names(subgroup_data) && "se" %in% names(subgroup_data)) {
        yi <- subgroup_data$log_effect_size
        vi <- subgroup_data$se^2
      } else if ("effect_size" %in% names(subgroup_data) && "se" %in% names(subgroup_data)) {
        if (effect_measure %in% c("OR", "RR")) {
          # For ratio measures, we work on the log scale
          yi <- log(subgroup_data$effect_size)
          vi <- subgroup_data$se^2
        } else {
          yi <- subgroup_data$effect_size
          vi <- subgroup_data$se^2
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
      subgroup_results[[as.character(group)]] <- list(
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
    }
  }
  
  # Run meta-regression to test for subgroup differences
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
  
  # Create moderator variable
  moderator <- as.factor(data[[subgroup_var]])
  
  # Run meta-regression
  if (model_type == "FE") {
    meta_regression <- metafor::rma(yi = yi, vi = vi, mods = ~ moderator, method = "FE")
  } else {
    meta_regression <- metafor::rma(yi = yi, vi = vi, mods = ~ moderator, method = method)
  }
  
  # Create a results object
  results <- list(
    subgroups = subgroup_results,
    betweenGroupQ = meta_regression$QM,
    betweenGroupDf = meta_regression$m,
    betweenGroupPvalue = meta_regression$QMp
  )
  
  return(results)
}

# Main execution
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript subgroup_analysis.R <data_file> <parameters_json>")
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
subgroup_var <- parameters$subgroupVar

# Run analysis
results <- run_subgroup_analysis(data, subgroup_var, model_type, effect_measure, method)

# Output results as JSON
cat(toJSON(results, auto_unbox = TRUE)) 