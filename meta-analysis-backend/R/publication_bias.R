#!/usr/bin/env Rscript

# Load required libraries
library(jsonlite)
library(metafor)
library(dplyr)

# Function to run publication bias analysis
run_publication_bias_analysis <- function(data, effect_measure = "OR", methods = c("egger", "begg", "trim_and_fill", "fail_safe_n")) {
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

  # Initialize results list
  results <- list()

  # Run random effects meta-analysis
  tryCatch({
    model <- metafor::rma(yi = yi, vi = vi, method = "REML")
  }, error = function(e) {
    stop(paste("Error in meta-analysis:", e$message))
  })

  # Egger's test
  if ("egger" %in% methods) {
    tryCatch({
      egger_test <- metafor::regtest(model)
      results$eggersTest <- list(
        intercept = egger_test$int,
        se = egger_test$se,
        pValue = egger_test$pval
      )
    }, error = function(e) {
      warning("Egger's test failed: ", e$message)
    })
  }

  # Begg's test
  if ("begg" %in% methods) {
    tryCatch({
      begg_test <- metafor::ranktest(model)
      results$begsTest <- list(
        rankCorrelation = begg_test$tau,
        pValue = begg_test$pval
      )
    }, error = function(e) {
      warning("Begg's test failed: ", e$message)
    })
  }

  # Trim and fill analysis
  if ("trim_and_fill" %in% methods) {
    tryCatch({
      trim_fill <- metafor::trimfill(model)
      results$trimAndFill <- list(
        originalEffect = if (effect_measure %in% c("OR", "RR")) exp(model$b) else model$b,
        adjustedEffect = if (effect_measure %in% c("OR", "RR")) exp(trim_fill$b) else trim_fill$b,
        originalCiLower = if (effect_measure %in% c("OR", "RR")) exp(model$ci.lb) else model$ci.lb,
        originalCiUpper = if (effect_measure %in% c("OR", "RR")) exp(model$ci.ub) else model$ci.ub,
        adjustedCiLower = if (effect_measure %in% c("OR", "RR")) exp(trim_fill$ci.lb) else trim_fill$ci.lb,
        adjustedCiUpper = if (effect_measure %in% c("OR", "RR")) exp(trim_fill$ci.ub) else trim_fill$ci.ub,
        numberOfImputedStudies = trim_fill$k0
      )
    }, error = function(e) {
      warning("Trim and fill analysis failed: ", e$message)
    })
  }

  # Fail-safe N
  if ("fail_safe_n" %in% methods) {
    tryCatch({
      failsafe_n <- metafor::fsn(yi = yi, vi = vi)
      results$failSafeN <- list(
        numberOfStudies = failsafe_n$fsnum,
        pValue = failsafe_n$pval
      )
    }, error = function(e) {
      warning("Fail-safe N calculation failed: ", e$message)
    })
  }

  return(results)
}

# Main execution
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript publication_bias.R <data_file> <parameters_json>")
}

# Read data and parameters
data_file <- args[1]
parameters_json <- args[2]

# Load data
data <- fromJSON(data_file)
parameters <- fromJSON(parameters_json)

# Extract parameters
effect_measure <- parameters$effectMeasure
methods <- parameters$methods

# Run analysis
results <- run_publication_bias_analysis(data, effect_measure, methods)

# Output results as JSON
cat(toJSON(results, auto_unbox = TRUE)) 