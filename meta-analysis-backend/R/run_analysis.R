#!/usr/bin/env Rscript

# Load required libraries
library(jsonlite)
library(metafor)
library(dplyr)

# Function to run meta-analysis
run_meta_analysis <- function(data, model_type = "RE", effect_measure = "OR", method = "REML", moderators = NULL) {
  # Validate input data
  if (!all(c("study_id", "study_label", "effect_size", "se") %in% names(data))) {
    stop("Data must contain study_id, study_label, effect_size, and se columns")
  }

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

  # Create moderator formula if moderators are provided
  mods <- NULL
  if (!is.null(moderators) && length(moderators) > 0) {
    # Check if all moderators exist in data
    missing_mods <- moderators[!moderators %in% names(data)]
    if (length(missing_mods) > 0) {
      stop(paste("Moderator(s) not found in data:", paste(missing_mods, collapse = ", ")))
    }
    mods <- as.formula(paste("~", paste(moderators, collapse = " + ")))
  }

  # Run the meta-analysis
  tryCatch({
    if (model_type == "FE") {
      if (is.null(mods)) {
        model <- metafor::rma(yi = yi, vi = vi, method = "FE")
      } else {
        model <- metafor::rma(yi = yi, vi = vi, mods = mods, method = "FE")
      }
    } else {
      if (is.null(mods)) {
        model <- metafor::rma(yi = yi, vi = vi, method = method)
      } else {
        model <- metafor::rma(yi = yi, vi = vi, mods = mods, method = method)
      }
    }
  }, error = function(e) {
    stop(paste("Error in meta-analysis:", e$message))
  })

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

  # Add prediction interval for random effects models
  if (model_type == "RE" && is.null(mods)) {
    pi_lb <- model$b - qt(0.975, model$k - model$p) * sqrt(model$tau2 + model$se^2)
    pi_ub <- model$b + qt(0.975, model$k - model$p) * sqrt(model$tau2 + model$se^2)
    
    results$predictionInterval <- list(
      lower = if (effect_measure %in% c("OR", "RR")) exp(pi_lb) else pi_lb,
      upper = if (effect_measure %in% c("OR", "RR")) exp(pi_ub) else pi_ub
    )
  }

  # Add moderator results if present
  if (!is.null(mods)) {
    results$moderators <- list(
      coefficients = as.data.frame(coef(model)),
      rSquared = if (!is.null(model$R2)) model$R2 else NULL
    )
  }

  return(results)
}

# Main execution
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript run_analysis.R <data_file> <parameters_json>")
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
moderators <- parameters$moderators

# Run analysis
results <- run_meta_analysis(data, model_type, effect_measure, method, moderators)

# Output results as JSON
cat(toJSON(results, auto_unbox = TRUE)) 