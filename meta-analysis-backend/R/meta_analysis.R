#' Meta-Analysis Computation Engine
#' 
#' This module contains functions for performing meta-analysis calculations.

library(metafor)
library(meta)
library(dplyr)
library(tidyr)
library(purrr)

#' Perform meta-analysis using the metafor package
#' 
#' @param data Preprocessed data frame
#' @param model_type Type of model ("FE" for fixed effects, "RE" for random effects)
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @param method Method for random effects model (REML, DL, etc.)
#' @param moderators Optional formula for moderator variables
#' @return A list containing the meta-analysis results
#' @export
run_meta_analysis <- function(data, model_type = "RE", effect_measure = "OR", 
                             method = "REML", moderators = NULL) {
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
  
  # Create the model formula
  if (is.null(moderators)) {
    formula <- yi ~ 1
  } else {
    formula <- as.formula(paste("yi", "~", moderators))
  }
  
  # Run the meta-analysis
  if (model_type == "FE") {
    model <- metafor::rma(yi = yi, vi = vi, method = "FE", data = data, formula = formula)
  } else {
    model <- metafor::rma(yi = yi, vi = vi, method = method, data = data, formula = formula)
  }
  
  # Create a results object with key statistics
  results <- list(
    model = model,
    summary = summary(model),
    effect_measure = effect_measure,
    model_type = model_type,
    k = model$k,  # Number of studies
    overall_effect = if (effect_measure %in% c("OR", "RR")) exp(model$b) else model$b,
    ci_lower = if (effect_measure %in% c("OR", "RR")) exp(model$ci.lb) else model$ci.lb,
    ci_upper = if (effect_measure %in% c("OR", "RR")) exp(model$ci.ub) else model$ci.ub,
    p_value = model$pval,
    heterogeneity = list(
      i_squared = model$I2,
      tau_squared = model$tau2,
      h_squared = model$H2,
      q_statistic = model$QE,
      q_df = model$k - 1,
      q_pvalue = model$QEp
    ),
    data = data
  )
  
  # Add prediction interval for random effects models
  if (model_type == "RE") {
    pi_lb <- model$b - qt(0.975, model$k - model$p) * sqrt(model$tau2 + model$se^2)
    pi_ub <- model$b + qt(0.975, model$k - model$p) * sqrt(model$tau2 + model$se^2)
    
    results$prediction_interval <- list(
      lower = if (effect_measure %in% c("OR", "RR")) exp(pi_lb) else pi_lb,
      upper = if (effect_measure %in% c("OR", "RR")) exp(pi_ub) else pi_ub
    )
  }
  
  class(results) <- c("meta_analysis_result", class(results))
  return(results)
}

#' Run subgroup analysis
#' 
#' @param data Preprocessed data frame
#' @param subgroup_var Name of the subgroup variable
#' @param model_type Type of model ("FE" for fixed effects, "RE" for random effects)
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @param method Method for random effects model (REML, DL, etc.)
#' @return A list containing the subgroup analysis results
#' @export
run_subgroup_analysis <- function(data, subgroup_var, model_type = "RE", 
                                 effect_measure = "OR", method = "REML") {
  if (!subgroup_var %in% names(data)) {
    stop("Subgroup variable not found in data")
  }
  
  # Split data by subgroup
  subgroups <- unique(data[[subgroup_var]])
  subgroup_results <- list()
  
  for (group in subgroups) {
    subgroup_data <- data %>% filter(!!sym(subgroup_var) == group)
    if (nrow(subgroup_data) > 0) {
      subgroup_results[[as.character(group)]] <- run_meta_analysis(
        subgroup_data, model_type, effect_measure, method
      )
    }
  }
  
  # Run meta-regression to test for subgroup differences
  moderator_formula <- as.formula(paste("~", subgroup_var))
  meta_regression <- run_meta_analysis(
    data, model_type, effect_measure, method, moderators = moderator_formula
  )
  
  # Create a results object
  results <- list(
    subgroups = subgroup_results,
    meta_regression = meta_regression,
    subgroup_var = subgroup_var,
    between_group_q = meta_regression$model$QM,
    between_group_df = meta_regression$model$m,
    between_group_pvalue = meta_regression$model$QMp
  )
  
  class(results) <- c("subgroup_analysis_result", class(results))
  return(results)
}

#' Perform sensitivity analysis (leave-one-out)
#' 
#' @param data Preprocessed data frame
#' @param model_type Type of model ("FE" for fixed effects, "RE" for random effects)
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @param method Method for random effects model (REML, DL, etc.)
#' @return A data frame with leave-one-out results
#' @export
run_sensitivity_analysis <- function(data, model_type = "RE", 
                                    effect_measure = "OR", method = "REML") {
  # Get baseline results with all studies
  baseline_results <- run_meta_analysis(data, model_type, effect_measure, method)
  baseline_effect <- baseline_results$overall_effect
  
  # Function to run analysis with one study removed
  run_leave_one_out <- function(i) {
    study_id <- data$study_id[i]
    study_label <- data$study_label[i]
    
    # Remove the study
    reduced_data <- data[-i, ]
    
    # Run meta-analysis on reduced dataset
    results <- run_meta_analysis(reduced_data, model_type, effect_measure, method)
    
    # Calculate percent change from baseline
    percent_change <- ((results$overall_effect - baseline_effect) / baseline_effect) * 100
    
    return(tibble(
      study_id = study_id,
      study_label = study_label,
      effect_size = results$overall_effect,
      ci_lower = results$ci_lower,
      ci_upper = results$ci_upper,
      p_value = results$p_value,
      i_squared = results$heterogeneity$i_squared,
      percent_change = percent_change
    ))
  }
  
  # Run leave-one-out for each study
  sensitivity_results <- map_df(1:nrow(data), run_leave_one_out)
  
  # Add baseline results
  baseline_row <- tibble(
    study_id = "None",
    study_label = "Overall Effect",
    effect_size = baseline_effect,
    ci_lower = baseline_results$ci_lower,
    ci_upper = baseline_results$ci_upper,
    p_value = baseline_results$p_value,
    i_squared = baseline_results$heterogeneity$i_squared,
    percent_change = 0
  )
  
  sensitivity_results <- bind_rows(baseline_row, sensitivity_results)
  
  return(sensitivity_results)
}

#' Assess publication bias
#' 
#' @param data Preprocessed data frame
#' @param methods Vector of methods to use
#' @return A list with publication bias assessment results
#' @export
assess_publication_bias <- function(data, methods = c("egger", "trim_and_fill", "fail_safe_n")) {
  # Prepare data for publication bias tests
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- log(data$effect_size)  # Assuming ratio measure
    vi <- data$se^2
  } else {
    stop("Data must contain effect_size and se columns")
  }
  
  results <- list()
  
  # Egger's test
  if ("egger" %in% methods) {
    egger_test <- metafor::regtest(x = yi, vi = vi, model = "lm")
    results$egger <- list(
      intercept = egger_test$estimate[1],
      slope = egger_test$estimate[2],
      se_intercept = egger_test$se[1],
      p_value = egger_test$pval[1],
      interpretation = if (egger_test$pval[1] < 0.05) 
        "Evidence of small-study effects (potential publication bias)" 
      else 
        "No significant evidence of small-study effects"
    )
  }
  
  # Trim and fill
  if ("trim_and_fill" %in% methods) {
    tf <- metafor::trimfill(metafor::rma(yi = yi, vi = vi))
    results$trim_and_fill <- list(
      k0 = tf$k0,  # Number of studies imputed
      estimate_original = exp(tf$b0),  # Original estimate
      estimate_adjusted = exp(tf$b),   # Adjusted estimate
      ci_lower_adjusted = exp(tf$ci.lb),
      ci_upper_adjusted = exp(tf$ci.ub),
      interpretation = if (tf$k0 > 0) 
        paste0(tf$k0, " studies imputed, suggesting possible publication bias") 
      else 
        "No studies imputed, suggesting no publication bias detected by this method"
    )
  }
  
  # Fail-safe N
  if ("fail_safe_n" %in% methods) {
    fsn <- metafor::fsn(yi = yi, vi = vi, type = "Rosenthal")
    results$fail_safe_n <- list(
      fsn = fsn$fsnum,
      interpretation = paste0(
        "The fail-safe N is ", fsn$fsnum, 
        ". This is the number of non-significant studies that would need to be added to nullify the observed effect."
      )
    )
  }
  
  # Begg's test
  if ("begg" %in% methods) {
    begg_test <- metafor::ranktest(yi = yi, vi = vi)
    results$begg <- list(
      tau = begg_test$tau,
      p_value = begg_test$pval,
      interpretation = if (begg_test$pval < 0.05) 
        "Evidence of publication bias according to Begg's test" 
      else 
        "No significant evidence of publication bias according to Begg's test"
    )
  }
  
  return(results)
}

#' Run meta-regression analysis
#' 
#' @param data Preprocessed data frame
#' @param moderators Formula specifying the moderators
#' @param model_type Type of model ("FE" for fixed effects, "RE" for random effects)
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @param method Method for random effects model (REML, DL, etc.)
#' @return A list containing the meta-regression results
#' @export
run_meta_regression <- function(data, moderators, model_type = "RE", 
                               effect_measure = "OR", method = "REML") {
  # Convert moderators to formula if it's a character vector
  if (is.character(moderators)) {
    moderator_formula <- as.formula(paste("~", paste(moderators, collapse = " + ")))
  } else if (inherits(moderators, "formula")) {
    moderator_formula <- moderators
  } else {
    stop("moderators must be a character vector or formula")
  }
  
  # Run meta-regression
  results <- run_meta_analysis(
    data, model_type, effect_measure, method, moderators = moderator_formula
  )
  
  # Add specific meta-regression information
  results$moderators <- moderator_formula
  results$coefficients <- coef(results$model)
  results$coefficient_tests <- data.frame(
    estimate = results$model$b,
    se = results$model$se,
    z_value = results$model$zval,
    p_value = results$model$pval,
    ci_lower = results$model$ci.lb,
    ci_upper = results$model$ci.ub
  )
  
  # Calculate R-squared (variance explained by moderators)
  if (model_type == "RE" && !is.null(results$model$R2)) {
    results$r_squared <- results$model$R2
  }
  
  class(results) <- c("meta_regression_result", class(results))
  return(results)
}

#' Calculate prediction intervals for random effects model
#' 
#' @param model A metafor rma object
#' @param level Confidence level for the prediction interval
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @return A list with the prediction interval bounds
#' @export
calculate_prediction_interval <- function(model, level = 0.95, effect_measure = "OR") {
  if (!inherits(model, "rma")) {
    stop("model must be a metafor rma object")
  }
  
  # Calculate prediction interval
  alpha <- 1 - level
  crit <- qt(1 - alpha/2, df = model$k - model$p)
  pi_lb <- model$b - crit * sqrt(model$tau2 + model$se^2)
  pi_ub <- model$b + crit * sqrt(model$tau2 + model$se^2)
  
  # Transform back to original scale if needed
  if (effect_measure %in% c("OR", "RR")) {
    pi_lb <- exp(pi_lb)
    pi_ub <- exp(pi_ub)
  }
  
  return(list(
    lower = pi_lb,
    upper = pi_ub,
    level = level
  ))
}

#' Perform cumulative meta-analysis
#' 
#' @param data Preprocessed data frame
#' @param sort_by Variable to sort studies by (e.g., "year", "effect_size")
#' @param model_type Type of model ("FE" for fixed effects, "RE" for random effects)
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @param method Method for random effects model (REML, DL, etc.)
#' @return A data frame with cumulative meta-analysis results
#' @export
run_cumulative_meta_analysis <- function(data, sort_by = "year", model_type = "RE", 
                                       effect_measure = "OR", method = "REML") {
  # Sort data
  if (sort_by %in% names(data)) {
    data <- data %>% arrange(!!sym(sort_by))
  } else {
    warning("Sort variable not found, using original order")
  }
  
  # Prepare data for cumulative meta-analysis
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (effect_measure %in% c("OR", "RR")) {
      yi <- log(data$effect_size)
      vi <- data$se^2
    } else {
      yi <- data$effect_size
      vi <- data$se^2
    }
  } else {
    stop("Data must contain effect_size and se columns")
  }
  
  # Run cumulative meta-analysis
  if (model_type == "FE") {
    cum_model <- metafor::cumul(metafor::rma(yi = yi, vi = vi, method = "FE"))
  } else {
    cum_model <- metafor::cumul(metafor::rma(yi = yi, vi = vi, method = method))
  }
  
  # Create results data frame
  cum_results <- data.frame(
    study_label = data$study_label,
    sort_value = data[[sort_by]],
    estimate = if (effect_measure %in% c("OR", "RR")) exp(cum_model$estimate) else cum_model$estimate,
    ci_lower = if (effect_measure %in% c("OR", "RR")) exp(cum_model$ci.lb) else cum_model$ci.lb,
    ci_upper = if (effect_measure %in% c("OR", "RR")) exp(cum_model$ci.ub) else cum_model$ci.ub,
    z_value = cum_model$zval,
    p_value = cum_model$pval
  )
  
  return(cum_results)
}

#' Perform influence analysis
#' 
#' @param data Preprocessed data frame
#' @param model_type Type of model ("FE" for fixed effects, "RE" for random effects)
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @param method Method for random effects model (REML, DL, etc.)
#' @return A list with influence analysis results
#' @export
run_influence_analysis <- function(data, model_type = "RE", 
                                  effect_measure = "OR", method = "REML") {
  # Prepare data
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (effect_measure %in% c("OR", "RR")) {
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
  
  # Run influence analysis
  inf <- metafor::influence(model)
  
  # Create results object
  results <- list(
    influence = inf,
    rstudent = inf$rstudent,
    dffits = inf$dffits,
    cook_d = inf$cook.d,
    cov_ratio = inf$cov.r,
    tau2_change = inf$tau2.del,
    q_change = inf$QE.del,
    weight_change = inf$weight,
    study_labels = data$study_label
  )
  
  # Add interpretation
  results$influential_studies <- data$study_label[abs(results$rstudent) > 2]
  
  return(results)
}

# Run publication bias tests
run_publication_bias_tests <- function(result, tests = c("egger", "trim_fill")) {
  model <- result$model
  data <- result$data
  effect_measure <- result$effect_measure
  
  # Initialize results list
  bias_results <- list()
  
  # Run Egger's test
  if ("egger" %in% tests) {
    egger_test <- metafor::regtest(model, model = "lm")
    
    bias_results$egger <- list(
      intercept = egger_test$estimate[1],
      se = egger_test$se[1],
      t_value = egger_test$zval[1],
      p_value = egger_test$pval[1]
    )
  }
  
  # Run Begg's test
  if ("begg" %in% tests) {
    begg_test <- metafor::ranktest(model)
    
    bias_results$begg <- list(
      tau = begg_test$tau,
      p_value = begg_test$pval
    )
  }
  
  # Run trim and fill
  if ("trim_fill" %in% tests) {
    trim_fill <- metafor::trimfill(model)
    
    # Calculate effect size and CI based on effect measure
    if (effect_measure %in% c("SMD", "MD", "COR")) {
      effect_size <- trim_fill$b
      ci_lower <- trim_fill$ci.lb
      ci_upper <- trim_fill$ci.ub
    } else {
      effect_size <- exp(trim_fill$b)
      ci_lower <- exp(trim_fill$ci.lb)
      ci_upper <- exp(trim_fill$ci.ub)
    }
    
    bias_results$trim_and_fill <- list(
      k0 = trim_fill$k0,  # Number of imputed studies
      estimate_original = result$summary$effect_size,
      estimate_adjusted = effect_size,
      ci_lower_adjusted = ci_lower,
      ci_upper_adjusted = ci_upper
    )
  }
  
  # Run fail-safe N
  if ("fail_safe_n" %in% tests) {
    # Calculate fail-safe N using Rosenthal's method
    z_values <- result$summary$z_value
    alpha <- 0.05  # Significance level
    
    # Calculate the number of studies with null results needed to make the overall effect non-significant
    fail_safe_n <- ceiling((sum(z_values)^2 / qnorm(1 - alpha/2)^2) - length(z_values))
    
    bias_results$fail_safe_n <- list(
      n = fail_safe_n,
      interpretation = ifelse(fail_safe_n > 5 * length(z_values) + 10, 
                             "Robust against publication bias", 
                             "Potentially vulnerable to publication bias")
    )
  }
  
  # Run p-curve analysis (simplified version)
  if ("p_curve" %in% tests) {
    # Extract p-values from the model
    p_values <- 2 * (1 - pnorm(abs(model$zval)))
    
    # Count p-values in different ranges
    p_curve <- list(
      p_01 = sum(p_values < 0.01),
      p_05 = sum(p_values < 0.05),
      p_10 = sum(p_values < 0.10),
      total = length(p_values)
    )
    
    # Calculate right-skewness (simplified)
    right_skew <- sum(p_values < 0.025) / sum(p_values < 0.05)
    
    bias_results$p_curve <- list(
      counts = p_curve,
      right_skew = right_skew,
      interpretation = ifelse(right_skew > 0.5, 
                             "Suggests presence of true effect", 
                             "May indicate p-hacking or selective reporting")
    )
  }
  
  return(bias_results)
}

# Run cumulative meta-analysis
run_cumulative_meta_analysis <- function(result, order_by = "year") {
  model <- result$model
  data <- result$data
  effect_measure <- result$effect_measure
  
  # Determine ordering
  if (order_by == "year" && "year" %in% names(data)) {
    order_indices <- order(data$year)
  } else if (order_by == "effect" && "effect_size" %in% names(data)) {
    order_indices <- order(data$effect_size)
  } else if (order_by == "precision" && "se" %in% names(data)) {
    order_indices <- order(1/data$se)  # Higher precision first
  } else if (order_by == "sample_size" && all(c("n1", "n2") %in% names(data))) {
    order_indices <- order(data$n1 + data$n2, decreasing = TRUE)
  } else {
    # Default to original order
    order_indices <- 1:nrow(data)
  }
  
  # Initialize results
  cumulative_results <- data.frame(
    study_label = character(),
    estimate = numeric(),
    ci_lower = numeric(),
    ci_upper = numeric(),
    p_value = numeric(),
    i_squared = numeric(),
    k = numeric()
  )
  
  # Run cumulative meta-analysis
  for (i in 1:length(order_indices)) {
    # Get indices up to current point
    current_indices <- order_indices[1:i]
    
    # Subset data
    current_data <- data[current_indices, ]
    
    # Run meta-analysis on subset
    if (effect_measure == "OR") {
      current_model <- metafor::rma(ai = ai, bi = bi, ci = ci, di = di, 
                                    data = current_data, 
                                    measure = "OR", 
                                    method = result$model_type,
                                    level = result$conf_level * 100)
    } else if (effect_measure == "RR") {
      current_model <- metafor::rma(ai = ai, bi = bi, ci = ci, di = di, 
                                    data = current_data, 
                                    measure = "RR", 
                                    method = result$model_type,
                                    level = result$conf_level * 100)
    } else if (effect_measure == "SMD") {
      current_model <- metafor::rma(m1i = m1, sd1i = sd1, n1i = n1, 
                                    m2i = m2, sd2i = sd2, n2i = n2, 
                                    data = current_data, 
                                    measure = "SMD", 
                                    method = result$model_type,
                                    level = result$conf_level * 100)
    } else if (effect_measure == "MD") {
      current_model <- metafor::rma(m1i = m1, sd1i = sd1, n1i = n1, 
                                    m2i = m2, sd2i = sd2, n2i = n2, 
                                    data = current_data, 
                                    measure = "MD", 
                                    method = result$model_type,
                                    level = result$conf_level * 100)
    } else if (effect_measure == "COR") {
      current_model <- metafor::rma(ri = ri, ni = ni, 
                                    data = current_data, 
                                    measure = "ZCOR", 
                                    method = result$model_type,
                                    level = result$conf_level * 100)
    }
    
    # Extract results
    if (effect_measure %in% c("SMD", "MD", "COR")) {
      estimate <- current_model$b
      ci_lower <- current_model$ci.lb
      ci_upper <- current_model$ci.ub
    } else {
      estimate <- exp(current_model$b)
      ci_lower <- exp(current_model$ci.lb)
      ci_upper <- exp(current_model$ci.ub)
    }
    
    # Add to results
    cumulative_results <- rbind(
      cumulative_results,
      data.frame(
        study_label = paste("Up to", current_data$study_label[length(current_indices)]),
        estimate = estimate,
        ci_lower = ci_lower,
        ci_upper = ci_upper,
        p_value = current_model$pval,
        i_squared = current_model$I2,
        k = current_model$k
      )
    )
  }
  
  return(cumulative_results)
}

# Run meta-regression
run_meta_regression <- function(result, moderators) {
  model <- result$model
  data <- result$data
  effect_measure <- result$effect_measure
  
  # Check if moderators exist in data
  missing_moderators <- moderators[!moderators %in% names(data)]
  if (length(missing_moderators) > 0) {
    stop(paste("Moderator(s) not found in data:", paste(missing_moderators, collapse = ", ")))
  }
  
  # Create formula for meta-regression
  formula_str <- paste("~", paste(moderators, collapse = " + "))
  formula <- as.formula(formula_str)
  
  # Run meta-regression
  if (effect_measure == "OR") {
    reg_model <- metafor::rma(ai = ai, bi = bi, ci = ci, di = di, 
                              mods = formula, 
                              data = data, 
                              measure = "OR", 
                              method = "REML",
                              level = result$conf_level * 100)
  } else if (effect_measure == "RR") {
    reg_model <- metafor::rma(ai = ai, bi = bi, ci = ci, di = di, 
                              mods = formula, 
                              data = data, 
                              measure = "RR", 
                              method = "REML",
                              level = result$conf_level * 100)
  } else if (effect_measure == "SMD") {
    reg_model <- metafor::rma(m1i = m1, sd1i = sd1, n1i = n1, 
                              m2i = m2, sd2i = sd2, n2i = n2, 
                              mods = formula, 
                              data = data, 
                              measure = "SMD", 
                              method = "REML",
                              level = result$conf_level * 100)
  } else if (effect_measure == "MD") {
    reg_model <- metafor::rma(m1i = m1, sd1i = sd1, n1i = n1, 
                              m2i = m2, sd2i = sd2, n2i = n2, 
                              mods = formula, 
                              data = data, 
                              measure = "MD", 
                              method = "REML",
                              level = result$conf_level * 100)
  } else if (effect_measure == "COR") {
    reg_model <- metafor::rma(ri = ri, ni = ni, 
                              mods = formula, 
                              data = data, 
                              measure = "ZCOR", 
                              method = "REML",
                              level = result$conf_level * 100)
  }
  
  # Extract results
  coefficients <- data.frame(
    moderator = rownames(reg_model$b),
    estimate = reg_model$b,
    se = reg_model$se,
    z_value = reg_model$zval,
    p_value = reg_model$pval,
    ci_lower = reg_model$ci.lb,
    ci_upper = reg_model$ci.ub
  )
  
  # For ratio measures, exponentiate the intercept
  if (!effect_measure %in% c("SMD", "MD", "COR")) {
    coefficients$estimate[1] <- exp(coefficients$estimate[1])
    coefficients$ci_lower[1] <- exp(coefficients$ci_lower[1])
    coefficients$ci_upper[1] <- exp(coefficients$ci_upper[1])
  }
  
  # Calculate R-squared
  r_squared <- (reg_model$QE - reg_model$QM) / reg_model$QE
  
  # Return results
  return(list(
    model = reg_model,
    coefficients = coefficients,
    r_squared = r_squared,
    q_statistic = reg_model$QM,
    q_df = reg_model$m,
    q_pvalue = reg_model$QMp,
    tau_squared = reg_model$tau2,
    i_squared = reg_model$I2
  ))
} 