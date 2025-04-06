#' Visualization Module
#' 
#' This module contains functions for creating visualizations for meta-analysis results.

library(ggplot2)
library(forestplot)
library(grid)
library(gridExtra)
library(dplyr)
library(tidyr)
library(metafor)

#' Create a forest plot
#' 
#' @param data Preprocessed data frame
#' @param meta_analysis_result Result from run_meta_analysis
#' @param sort_by Variable to sort studies by (e.g., "effect_size", "study_label")
#' @param show_weights Whether to show study weights
#' @param show_heterogeneity Whether to show heterogeneity statistics
#' @return A ggplot object
#' @export
create_forest_plot <- function(data, meta_analysis_result, sort_by = "effect_size", 
                              show_weights = TRUE, show_heterogeneity = TRUE) {
  # Extract effect sizes and confidence intervals
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    data <- data %>%
      mutate(
        effect_size = exp(log_effect_size),
        ci_lower = exp(log_effect_size - 1.96 * se),
        ci_upper = exp(log_effect_size + 1.96 * se)
      )
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (meta_analysis_result$effect_measure %in% c("OR", "RR")) {
      data <- data %>%
        mutate(
          log_effect_size = log(effect_size),
          ci_lower = exp(log_effect_size - 1.96 * se),
          ci_upper = exp(log_effect_size + 1.96 * se)
        )
    } else {
      data <- data %>%
        mutate(
          ci_lower = effect_size - 1.96 * se,
          ci_upper = effect_size + 1.96 * se
        )
    }
  }
  
  # Sort data
  if (sort_by %in% names(data)) {
    data <- data %>% arrange(!!sym(sort_by))
  }
  
  # Create study labels
  if (!"study_label" %in% names(data)) {
    data <- data %>%
      mutate(study_label = paste0("Study ", row_number()))
  }
  
  # Create the forest plot
  p <- ggplot(data, aes(y = reorder(study_label, effect_size))) +
    geom_vline(xintercept = if (meta_analysis_result$effect_measure %in% c("OR", "RR")) 1 else 0, 
               linetype = "dashed", color = "gray50") +
    geom_point(aes(x = effect_size), size = 3) +
    geom_errorbarh(aes(xmin = ci_lower, xmax = ci_upper), height = 0.2) +
    geom_point(aes(x = meta_analysis_result$overall_effect), 
               color = "red", size = 4, shape = 18) +
    geom_errorbarh(aes(xmin = meta_analysis_result$ci_lower, 
                       xmax = meta_analysis_result$ci_upper), 
                   color = "red", height = 0.2) +
    labs(
      title = "Forest Plot",
      x = if (meta_analysis_result$effect_measure %in% c("OR", "RR")) "Odds Ratio" else "Effect Size",
      y = "Study"
    ) +
    theme_minimal() +
    theme(
      axis.text.y = element_text(size = 10),
      axis.title = element_text(size = 12, face = "bold"),
      plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
    )
  
  # Add weights if requested
  if (show_weights && "weight" %in% names(data)) {
    p <- p + geom_text(aes(x = max(ci_upper) * 1.05, 
                           label = sprintf("%.1f%%", weight * 100 / sum(weight))),
                       hjust = 0, size = 3)
  }
  
  # Add heterogeneity statistics if requested
  if (show_heterogeneity) {
    het_stats <- paste0(
      "I² = ", round(meta_analysis_result$heterogeneity$i_squared, 1), "%, ",
      "Q = ", round(meta_analysis_result$heterogeneity$q_statistic, 2), 
      " (df = ", meta_analysis_result$heterogeneity$q_df, ", p = ", 
      format.pval(meta_analysis_result$heterogeneity$q_pvalue, digits = 3), ")"
    )
    
    p <- p + annotate("text", x = min(data$ci_lower) * 0.9, y = 0.5, 
                      label = het_stats, hjust = 0, vjust = 0.5, size = 3)
  }
  
  return(p)
}

#' Create a funnel plot
#' 
#' @param data Preprocessed data frame
#' @param meta_analysis_result Result from run_meta_analysis
#' @param method Method for funnel plot ("standard", "contour", "trim_and_fill")
#' @return A ggplot object
#' @export
create_funnel_plot <- function(data, meta_analysis_result, method = "standard") {
  # Prepare data
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (meta_analysis_result$effect_measure %in% c("OR", "RR")) {
      yi <- log(data$effect_size)
    } else {
      yi <- data$effect_size
    }
    vi <- data$se^2
  } else {
    stop("Data must contain effect_size and se columns")
  }
  
  # Create the funnel plot
  if (method == "standard") {
    p <- metafor::funnel(yi, vi, 
                         xlab = if (meta_analysis_result$effect_measure %in% c("OR", "RR")) 
                           "Log Odds Ratio" else "Effect Size",
                         ylab = "Standard Error",
                         main = "Funnel Plot")
  } else if (method == "contour") {
    p <- metafor::funnel(yi, vi, 
                         xlab = if (meta_analysis_result$effect_measure %in% c("OR", "RR")) 
                           "Log Odds Ratio" else "Effect Size",
                         ylab = "Standard Error",
                         main = "Contour-Enhanced Funnel Plot",
                         level = c(0.9, 0.95, 0.99),
                         shade = c("white", "gray75", "gray90"))
  } else if (method == "trim_and_fill") {
    # Run trim and fill analysis
    tf <- metafor::trimfill(metafor::rma(yi = yi, vi = vi))
    
    # Create funnel plot with imputed studies
    p <- metafor::funnel(tf, 
                         xlab = if (meta_analysis_result$effect_measure %in% c("OR", "RR")) 
                           "Log Odds Ratio" else "Effect Size",
                         ylab = "Standard Error",
                         main = "Trim and Fill Funnel Plot")
  }
  
  return(p)
}

#' Create a cumulative forest plot
#' 
#' @param cumulative_results Result from run_cumulative_meta_analysis
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @return A ggplot object
#' @export
create_cumulative_forest_plot <- function(cumulative_results, effect_measure = "OR") {
  # Create the cumulative forest plot
  p <- ggplot(cumulative_results, aes(y = reorder(study_label, sort_value))) +
    geom_vline(xintercept = if (effect_measure %in% c("OR", "RR")) 1 else 0, 
               linetype = "dashed", color = "gray50") +
    geom_point(aes(x = estimate), size = 3) +
    geom_errorbarh(aes(xmin = ci_lower, xmax = ci_upper), height = 0.2) +
    labs(
      title = "Cumulative Meta-Analysis",
      x = if (effect_measure %in% c("OR", "RR")) "Odds Ratio" else "Effect Size",
      y = "Study"
    ) +
    theme_minimal() +
    theme(
      axis.text.y = element_text(size = 10),
      axis.title = element_text(size = 12, face = "bold"),
      plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
    )
  
  return(p)
}

#' Create a bubble plot for meta-regression
#' 
#' @param data Preprocessed data frame
#' @param meta_regression_result Result from run_meta_regression
#' @param moderator_var Name of the moderator variable
#' @param effect_measure Effect measure used ("OR", "RR", "MD", etc.)
#' @return A ggplot object
#' @export
create_bubble_plot <- function(data, meta_regression_result, moderator_var, effect_measure = "OR") {
  # Prepare data
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    data <- data %>%
      mutate(
        effect_size = exp(log_effect_size),
        weight = 1 / (se^2)
      )
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (effect_measure %in% c("OR", "RR")) {
      data <- data %>%
        mutate(
          log_effect_size = log(effect_size),
          weight = 1 / (se^2)
        )
    } else {
      data <- data %>%
        mutate(weight = 1 / (se^2))
    }
  }
  
  # Extract regression line
  moderator_values <- seq(min(data[[moderator_var]]), max(data[[moderator_var]]), length.out = 100)
  regression_line <- data.frame(
    moderator = moderator_values,
    effect = if (effect_measure %in% c("OR", "RR")) {
      exp(meta_regression_result$model$b[1] + meta_regression_result$model$b[2] * moderator_values)
    } else {
      meta_regression_result$model$b[1] + meta_regression_result$model$b[2] * moderator_values
    }
  )
  
  # Create the bubble plot
  p <- ggplot(data, aes_string(x = moderator_var, y = "effect_size", size = "weight")) +
    geom_point(alpha = 0.6) +
    geom_line(data = regression_line, aes(x = moderator, y = effect), color = "red") +
    labs(
      title = paste("Meta-Regression:", moderator_var),
      x = moderator_var,
      y = if (effect_measure %in% c("OR", "RR")) "Odds Ratio" else "Effect Size",
      size = "Weight"
    ) +
    theme_minimal() +
    theme(
      axis.title = element_text(size = 12, face = "bold"),
      plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
    )
  
  return(p)
}

#' Create a Galbraith (radial) plot
#' 
#' @param data Preprocessed data frame
#' @param meta_analysis_result Result from run_meta_analysis
#' @return A ggplot object
#' @export
create_galbraith_plot <- function(data, meta_analysis_result) {
  # Prepare data
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    data <- data %>%
      mutate(
        z_score = log_effect_size / se,
        precision = 1 / se
      )
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (meta_analysis_result$effect_measure %in% c("OR", "RR")) {
      data <- data %>%
        mutate(
          log_effect_size = log(effect_size),
          z_score = log_effect_size / se,
          precision = 1 / se
        )
    } else {
      data <- data %>%
        mutate(
          z_score = effect_size / se,
          precision = 1 / se
        )
    }
  }
  
  # Create the Galbraith plot
  p <- ggplot(data, aes(x = precision, y = z_score)) +
    geom_point(size = 3) +
    geom_hline(yintercept = 0, linetype = "dashed", color = "gray50") +
    geom_abline(intercept = 0, slope = 1, linetype = "dashed", color = "red") +
    geom_abline(intercept = 0, slope = -1, linetype = "dashed", color = "red") +
    geom_text(aes(label = study_label), vjust = -0.5, size = 3) +
    labs(
      title = "Galbraith (Radial) Plot",
      x = "Precision (1/SE)",
      y = "Standardized Effect (Z-score)"
    ) +
    theme_minimal() +
    theme(
      axis.title = element_text(size = 12, face = "bold"),
      plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
    )
  
  return(p)
}

#' Create a L'Abbe plot
#' 
#' @param data Preprocessed data frame
#' @return A ggplot object
#' @export
create_labbe_plot <- function(data) {
  # Check if required columns exist
  required_cols <- c("events_treatment", "n_treatment", "events_control", "n_control")
  if (!all(required_cols %in% names(data))) {
    stop("Data must contain columns: ", paste(required_cols, collapse = ", "))
  }
  
  # Calculate proportions
  data <- data %>%
    mutate(
      p_treatment = events_treatment / n_treatment,
      p_control = events_control / n_control
    )
  
  # Create the L'Abbe plot
  p <- ggplot(data, aes(x = p_control, y = p_treatment, size = n_treatment + n_control)) +
    geom_point(alpha = 0.6) +
    geom_abline(intercept = 0, slope = 1, linetype = "dashed", color = "gray50") +
    geom_text(aes(label = study_label), vjust = -0.5, size = 3) +
    labs(
      title = "L'Abbe Plot",
      x = "Control Group Proportion",
      y = "Treatment Group Proportion",
      size = "Total Sample Size"
    ) +
    theme_minimal() +
    theme(
      axis.title = element_text(size = 12, face = "bold"),
      plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
    )
  
  return(p)
}

#' Create a Baujat plot
#' 
#' @param data Preprocessed data frame
#' @param meta_analysis_result Result from run_meta_analysis
#' @return A ggplot object
#' @export
create_baujat_plot <- function(data, meta_analysis_result) {
  # Prepare data
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (meta_analysis_result$effect_measure %in% c("OR", "RR")) {
      yi <- log(data$effect_size)
    } else {
      yi <- data$effect_size
    }
    vi <- data$se^2
  } else {
    stop("Data must contain effect_size and se columns")
  }
  
  # Run the meta-analysis
  model <- metafor::rma(yi = yi, vi = vi)
  
  # Calculate influence statistics
  inf <- metafor::influence(model)
  
  # Create data frame for plotting
  plot_data <- data.frame(
    study_label = data$study_label,
    x = inf$inf$inf,
    y = inf$inf$dfb
  )
  
  # Create the Baujat plot
  p <- ggplot(plot_data, aes(x = x, y = y)) +
    geom_point(size = 3) +
    geom_text(aes(label = study_label), vjust = -0.5, size = 3) +
    labs(
      title = "Baujat Plot",
      x = "Overall Influence",
      y = "Influence on Fixed Effect"
    ) +
    theme_minimal() +
    theme(
      axis.title = element_text(size = 12, face = "bold"),
      plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
    )
  
  return(p)
}

#' Create a funnel plot asymmetry test plot
#' 
#' @param data Preprocessed data frame
#' @param meta_analysis_result Result from run_meta_analysis
#' @param test_type Type of test ("egger", "begg")
#' @return A ggplot object
#' @export
create_funnel_test_plot <- function(data, meta_analysis_result, test_type = "egger") {
  # Prepare data
  if ("log_effect_size" %in% names(data) && "se" %in% names(data)) {
    yi <- data$log_effect_size
    vi <- data$se^2
  } else if ("effect_size" %in% names(data) && "se" %in% names(data)) {
    if (meta_analysis_result$effect_measure %in% c("OR", "RR")) {
      yi <- log(data$effect_size)
    } else {
      yi <- data$effect_size
    }
    vi <- data$se^2
  } else {
    stop("Data must contain effect_size and se columns")
  }
  
  # Run the test
  if (test_type == "egger") {
    test <- metafor::regtest(x = yi, vi = vi, model = "lm")
    
    # Create data frame for plotting
    plot_data <- data.frame(
      x = 1 / sqrt(vi),
      y = yi / sqrt(vi)
    )
    
    # Calculate regression line
    slope <- test$estimate[2]
    intercept <- test$estimate[1]
    
    # Create the Egger's test plot
    p <- ggplot(plot_data, aes(x = x, y = y)) +
      geom_point(size = 3) +
      geom_abline(intercept = intercept, slope = slope, color = "red") +
      geom_text(aes(label = data$study_label), vjust = -0.5, size = 3) +
      labs(
        title = "Egger's Test for Funnel Plot Asymmetry",
        x = "Precision (1/SE)",
        y = "Standardized Effect (Effect/SE)"
      ) +
      theme_minimal() +
      theme(
        axis.title = element_text(size = 12, face = "bold"),
        plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
      )
    
    # Add test results
    p <- p + annotate("text", x = min(plot_data$x), y = max(plot_data$y), 
                      label = paste0("Intercept = ", round(intercept, 3), 
                                   "\np-value = ", format.pval(test$pval[1], digits = 3)),
                      hjust = 0, vjust = 1, size = 3)
    
  } else if (test_type == "begg") {
    test <- metafor::ranktest(yi = yi, vi = vi)
    
    # Create data frame for plotting
    plot_data <- data.frame(
      x = rank(yi),
      y = rank(1/vi)
    )
    
    # Create the Begg's test plot
    p <- ggplot(plot_data, aes(x = x, y = y)) +
      geom_point(size = 3) +
      geom_text(aes(label = data$study_label), vjust = -0.5, size = 3) +
      labs(
        title = "Begg's Test for Funnel Plot Asymmetry",
        x = "Rank of Effect Size",
        y = "Rank of Precision"
      ) +
      theme_minimal() +
      theme(
        axis.title = element_text(size = 12, face = "bold"),
        plot.title = element_text(size = 14, face = "bold", hjust = 0.5)
      )
    
    # Add test results
    p <- p + annotate("text", x = min(plot_data$x), y = max(plot_data$y), 
                      label = paste0("Kendall's tau = ", round(test$tau, 3), 
                                   "\np-value = ", format.pval(test$pval, digits = 3)),
                      hjust = 0, vjust = 1, size = 3)
  }
  
  return(p)
} 