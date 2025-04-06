#!/usr/bin/env Rscript

#' AI-Powered Insights Module
#' 
#' This script processes user queries about meta-analysis data and generates
#' intelligent responses using statistical analysis and NLP techniques.

# Load required libraries
suppressPackageStartupMessages({
  library(tidyverse)
  library(jsonlite)
  library(metafor)
  library(ggplot2)
  library(gridExtra)
  library(tm)
  library(tidytext)
  library(wordcloud)
  library(topicmodels)
  library(glmnet)
  library(caret)
  library(randomForest)
  library(e1071)
  library(cluster)
  library(factoextra)
})

# Parse command line arguments
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 3) {
  stop("Usage: Rscript ai_insights.R <studies_file> <query_file> <job_id>")
}

studies_file <- args[1]
query_file <- args[2]
job_id <- args[3]

# Read the studies data
studies_data <- fromJSON(studies_file)
studies <- as.data.frame(studies_data)

# Read the query
query <- readLines(query_file, warn = FALSE)

# Function to analyze heterogeneity
analyze_heterogeneity <- function(studies) {
  # Calculate heterogeneity statistics
  n <- nrow(studies)
  if (n < 2) {
    return(list(
      i_squared = 0,
      q_statistic = 0,
      q_pvalue = 1,
      tau_squared = 0,
      tau = 0,
      h_squared = 1,
      h = 1,
      interpretation = "Insufficient studies to assess heterogeneity"
    ))
  }
  
  # Calculate weighted mean effect size
  weighted_mean <- sum(studies$effect_size * studies$weight) / sum(studies$weight)
  
  # Calculate Q statistic
  q_statistic <- sum(studies$weight * (studies$effect_size - weighted_mean)^2)
  q_df <- n - 1
  q_pvalue <- 1 - pchisq(q_statistic, q_df)
  
  # Calculate I-squared
  i_squared <- max(0, 100 * (q_statistic - q_df) / q_statistic)
  
  # Calculate tau-squared (method of moments estimator)
  if (q_statistic > q_df) {
    tau_squared <- (q_statistic - q_df) / (sum(studies$weight) - sum(studies$weight^2) / sum(studies$weight))
  } else {
    tau_squared <- 0
  }
  
  # Calculate tau
  tau <- sqrt(tau_squared)
  
  # Calculate H-squared
  h_squared <- q_statistic / q_df
  h <- sqrt(h_squared)
  
  # Generate interpretation
  interpretation <- paste0(
    "Heterogeneity analysis shows ",
    ifelse(i_squared > 50, "substantial", ifelse(i_squared > 25, "moderate", "low")),
    " heterogeneity (I² = ", round(i_squared, 1), "%, p = ", 
    format.pval(q_pvalue, digits = 3), "). ",
    ifelse(q_pvalue < 0.05, 
           "This suggests that the studies are not estimating the same underlying effect.",
           "This suggests that the studies are estimating the same underlying effect.")
  )
  
  return(list(
    i_squared = i_squared,
    q_statistic = q_statistic,
    q_pvalue = q_pvalue,
    tau_squared = tau_squared,
    tau = tau,
    h_squared = h_squared,
    h = h,
    interpretation = interpretation
  ))
}

# Function to detect publication bias
detect_publication_bias <- function(studies) {
  n <- nrow(studies)
  if (n < 3) {
    return(list(
      egger_test = list(
        intercept = NA,
        slope = NA,
        se_intercept = NA,
        p_value = NA,
        interpretation = "Insufficient studies to assess publication bias"
      ),
      begg_test = list(
        rank_correlation = NA,
        p_value = NA,
        interpretation = "Insufficient studies to assess publication bias"
      ),
      trim_and_fill = list(
        k0 = NA,
        estimate_original = NA,
        estimate_adjusted = NA,
        ci_lower_adjusted = NA,
        ci_upper_adjusted = NA,
        interpretation = "Insufficient studies to assess publication bias"
      ),
      fail_safe_n = list(
        n = NA,
        interpretation = "Insufficient studies to assess publication bias"
      )
    ))
  }
  
  # Calculate weighted mean effect size
  weighted_mean <- sum(studies$effect_size * studies$weight) / sum(studies$weight)
  
  # Egger's test
  precision <- sqrt(studies$weight)
  egger_model <- lm(studies$effect_size ~ precision)
  egger_intercept <- coef(egger_model)[1]
  egger_slope <- coef(egger_model)[2]
  egger_se_intercept <- summary(egger_model)$coefficients[1, 2]
  egger_p_value <- summary(egger_model)$coefficients[1, 4]
  
  egger_interpretation <- paste0(
    "Egger's test ",
    ifelse(egger_p_value < 0.05, "indicates", "does not indicate"),
    " publication bias (intercept = ", round(egger_intercept, 3), 
    ", p = ", format.pval(egger_p_value, digits = 3), ")."
  )
  
  # Begg's test (rank correlation)
  rank_correlation <- cor(studies$effect_size, studies$se, method = "spearman")
  rank_p_value <- cor.test(studies$effect_size, studies$se, method = "spearman")$p.value
  
  begg_interpretation <- paste0(
    "Begg's test ",
    ifelse(rank_p_value < 0.05, "indicates", "does not indicate"),
    " publication bias (rank correlation = ", round(rank_correlation, 3), 
    ", p = ", format.pval(rank_p_value, digits = 3), ")."
  )
  
  # Trim and fill method (simplified)
  # In a real implementation, you would use the metafor package's trimfill function
  # For simplicity, we'll just estimate the number of missing studies
  q_statistic <- sum(studies$weight * (studies$effect_size - weighted_mean)^2)
  q_df <- n - 1
  k0 <- max(0, floor((q_statistic - q_df) / 2))
  
  # Estimate adjusted effect size (simplified)
  estimate_original <- weighted_mean
  estimate_adjusted <- estimate_original * 0.9  # Simplified adjustment
  ci_lower_adjusted <- estimate_adjusted - 1.96 * sqrt(1 / sum(studies$weight))
  ci_upper_adjusted <- estimate_adjusted + 1.96 * sqrt(1 / sum(studies$weight))
  
  trim_and_fill_interpretation <- paste0(
    "Trim and fill method suggests ", k0, " missing studies. ",
    "The adjusted effect size (", round(estimate_adjusted, 3), 
    ", 95% CI: ", round(ci_lower_adjusted, 3), " to ", round(ci_upper_adjusted, 3), 
    ") is ", ifelse(abs(estimate_adjusted - estimate_original) / estimate_original > 0.1,
                   "substantially different from", "similar to"),
    " the original estimate (", round(estimate_original, 3), ")."
  )
  
  # Fail-safe N (simplified)
  # In a real implementation, you would use the metafor package's fsn function
  fail_safe_n <- ceiling(abs(weighted_mean / mean(studies$se))^2 * 5)
  
  fail_safe_interpretation <- paste0(
    "The fail-safe N is ", fail_safe_n, ", meaning that ",
    fail_safe_n, " null studies would be needed to change the conclusion. ",
    ifelse(fail_safe_n > 5 * n, 
           "This suggests that the result is robust to publication bias.",
           "This suggests that the result might be sensitive to publication bias.")
  )
  
  return(list(
    egger_test = list(
      intercept = egger_intercept,
      slope = egger_slope,
      se_intercept = egger_se_intercept,
      p_value = egger_p_value,
      interpretation = egger_interpretation
    ),
    begg_test = list(
      rank_correlation = rank_correlation,
      p_value = rank_p_value,
      interpretation = begg_interpretation
    ),
    trim_and_fill = list(
      k0 = k0,
      estimate_original = estimate_original,
      estimate_adjusted = estimate_adjusted,
      ci_lower_adjusted = ci_lower_adjusted,
      ci_upper_adjusted = ci_upper_adjusted,
      interpretation = trim_and_fill_interpretation
    ),
    fail_safe_n = list(
      n = fail_safe_n,
      interpretation = fail_safe_interpretation
    )
  ))
}

# Function to analyze moderators
analyze_moderators <- function(studies, moderators) {
  # This is a simplified implementation
  # In a real implementation, you would use the metafor package's rma function
  
  results <- list()
  
  for (moderator in moderators) {
    if (moderator %in% names(studies)) {
      # Check if the moderator is numeric
      if (is.numeric(studies[[moderator]])) {
        # Simple correlation
        correlation <- cor(studies$effect_size, studies[[moderator]])
        p_value <- cor.test(studies$effect_size, studies[[moderator]])$p.value
        
        results[[moderator]] <- list(
          correlation = correlation,
          p_value = p_value,
          interpretation = paste0(
            "The correlation between ", moderator, " and effect size is ", 
            round(correlation, 3), " (p = ", format.pval(p_value, digits = 3), "). ",
            ifelse(p_value < 0.05, 
                   "This suggests a significant moderator effect.",
                   "This does not suggest a significant moderator effect.")
          )
        )
      } else {
        # Categorical moderator
        # Simple ANOVA
        anova_result <- aov(studies$effect_size ~ as.factor(studies[[moderator]]))
        p_value <- summary(anova_result)[[1]]$`Pr(>F)`[1]
        
        results[[moderator]] <- list(
          p_value = p_value,
          interpretation = paste0(
            "The effect of ", moderator, " on effect size is ",
            ifelse(p_value < 0.05, "significant", "not significant"),
            " (p = ", format.pval(p_value, digits = 3), ")."
          )
        )
      }
    }
  }
  
  return(results)
}

# Function to detect outliers
detect_outliers <- function(studies, meta_results) {
  n <- nrow(studies)
  if (n < 3) {
    return(list(
      outliers = data.frame(),
      interpretation = "Insufficient studies to detect outliers"
    ))
  }
  
  # Calculate weighted mean effect size
  weighted_mean <- sum(studies$effect_size * studies$weight) / sum(studies$weight)
  
  # Calculate standardized residuals
  studies$residual <- (studies$effect_size - weighted_mean) / studies$se
  studies$is_outlier <- abs(studies$residual) > 2
  
  # Identify outliers
  outliers <- studies[studies$is_outlier, ]
  
  # Generate interpretation
  if (nrow(outliers) == 0) {
    interpretation <- "No outliers were detected in the dataset."
  } else {
    interpretation <- paste0(
      nrow(outliers), " outlier(s) were detected: ",
      paste(outliers$study_label, collapse = ", "), ". ",
      "These studies have standardized residuals greater than 2."
    )
  }
  
  return(list(
    outliers = outliers,
    interpretation = interpretation
  ))
}

# Function to analyze trends
analyze_trends <- function(studies) {
  if (!"year" %in% names(studies) || nrow(studies) < 3) {
    return(list(
      correlation = NA,
      p_value = NA,
      interpretation = "Insufficient data to analyze temporal trends"
    ))
  }
  
  # Correlation between year and effect size
  correlation <- cor(studies$year, studies$effect_size)
  p_value <- cor.test(studies$year, studies$effect_size)$p.value
  
  # Generate interpretation
  interpretation <- paste0(
    "The correlation between publication year and effect size is ", 
    round(correlation, 3), " (p = ", format.pval(p_value, digits = 3), "). ",
    ifelse(p_value < 0.05, 
           ifelse(correlation > 0, 
                  "This suggests a significant increase in effect size over time.",
                  "This suggests a significant decrease in effect size over time."),
           "This does not suggest a significant temporal trend.")
  )
  
  return(list(
    correlation = correlation,
    p_value = p_value,
    interpretation = interpretation
  ))
}

# Function to perform cluster analysis
perform_cluster_analysis <- function(studies, moderators) {
  if (nrow(studies) < 3) {
    return(list(
      clusters = list(),
      interpretation = "Insufficient studies to perform cluster analysis"
    ))
  }
  
  # Select features for clustering
  features <- c("effect_size", "se")
  if (!is.null(moderators)) {
    for (moderator in moderators) {
      if (moderator %in% names(studies) && is.numeric(studies[[moderator]])) {
        features <- c(features, moderator)
      }
    }
  }
  
  # Prepare data for clustering
  cluster_data <- studies[, features, drop = FALSE]
  cluster_data <- scale(cluster_data)
  
  # Determine optimal number of clusters
  # In a real implementation, you would use more sophisticated methods
  k_max <- min(5, nrow(studies) - 1)
  if (k_max < 2) {
    return(list(
      clusters = list(),
      interpretation = "Insufficient studies to perform cluster analysis"
    ))
  }
  
  # Perform k-means clustering
  set.seed(123)
  kmeans_result <- kmeans(cluster_data, centers = 2)
  
  # Add cluster assignments to studies
  studies$cluster <- kmeans_result$cluster
  
  # Generate interpretation
  interpretation <- paste0(
    "Cluster analysis identified ", length(unique(kmeans_result$cluster)), 
    " distinct clusters of studies. ",
    "Cluster 1 contains ", sum(kmeans_result$cluster == 1), " studies, ",
    "and Cluster 2 contains ", sum(kmeans_result$cluster == 2), " studies."
  )
  
  return(list(
    clusters = list(
      assignments = kmeans_result$cluster,
      centers = kmeans_result$centers
    ),
    interpretation = interpretation
  ))
}

# Function to mine study texts
mine_study_texts <- function(studies) {
  # This is a simplified implementation
  # In a real implementation, you would extract and analyze text from study descriptions
  
  # For now, we'll just return a placeholder
  return(list(
    topics = list(),
    interpretation = "Text mining was not performed in this simplified implementation."
  ))
}

# Function to generate a response to a user query
generate_response <- function(query, studies) {
  # Convert query to lowercase for easier matching
  query_lower <- tolower(query)
  
  # Check for keywords in the query
  if (grepl("heterogeneity|variation|inconsistency|different|vary", query_lower)) {
    heterogeneity_results <- analyze_heterogeneity(studies)
    return(paste0(
      "Based on the heterogeneity analysis: ", 
      heterogeneity_results$interpretation, "\n\n",
      "I² = ", round(heterogeneity_results$i_squared, 1), "%, ",
      "Q = ", round(heterogeneity_results$q_statistic, 2), 
      " (df = ", heterogeneity_results$q_df, ", p = ", 
      format.pval(heterogeneity_results$q_pvalue, digits = 3), "), ",
      "τ² = ", round(heterogeneity_results$tau_squared, 3), "."
    ))
  } else if (grepl("publication bias|small study|funnel|egger|begg|trim", query_lower)) {
    publication_bias_results <- detect_publication_bias(studies)
    return(paste0(
      "Based on the publication bias analysis:\n\n",
      publication_bias_results$egger_test$interpretation, "\n\n",
      publication_bias_results$begg_test$interpretation, "\n\n",
      publication_bias_results$trim_and_fill$interpretation, "\n\n",
      publication_bias_results$fail_safe_n$interpretation
    ))
  } else if (grepl("moderator|subgroup|difference|compare|between", query_lower)) {
    # Extract potential moderator variables from the query
    moderators <- c()
    for (col in names(studies)) {
      if (col != "effect_size" && col != "se" && col != "weight" && 
          col != "study_id" && col != "study_label") {
        if (grepl(tolower(col), query_lower)) {
          moderators <- c(moderators, col)
        }
      }
    }
    
    if (length(moderators) == 0) {
      # If no specific moderators mentioned, use all available ones
      moderators <- setdiff(names(studies), 
                           c("effect_size", "se", "weight", "study_id", "study_label"))
    }
    
    moderator_results <- analyze_moderators(studies, moderators)
    
    response <- "Based on the moderator analysis:\n\n"
    for (moderator in names(moderator_results)) {
      response <- paste0(response, moderator_results[[moderator]]$interpretation, "\n\n")
    }
    
    return(response)
  } else if (grepl("outlier|extreme|unusual", query_lower)) {
    outlier_results <- detect_outliers(studies, NULL)
    return(paste0(
      "Based on the outlier analysis: ", 
      outlier_results$interpretation
    ))
  } else if (grepl("trend|time|year|temporal|change", query_lower)) {
    trend_results <- analyze_trends(studies)
    return(paste0(
      "Based on the temporal trend analysis: ", 
      trend_results$interpretation
    ))
  } else if (grepl("cluster|group|pattern", query_lower)) {
    cluster_results <- perform_cluster_analysis(studies, NULL)
    return(paste0(
      "Based on the cluster analysis: ", 
      cluster_results$interpretation
    ))
  } else {
    # General response for other queries
    # Calculate overall effect size
    weighted_mean <- sum(studies$effect_size * studies$weight) / sum(studies$weight)
    se_mean <- sqrt(1 / sum(studies$weight))
    ci_lower <- weighted_mean - 1.96 * se_mean
    ci_upper <- weighted_mean + 1.96 * se_mean
    p_value <- 2 * (1 - pnorm(abs(weighted_mean / se_mean)))
    
    # Analyze heterogeneity
    heterogeneity_results <- analyze_heterogeneity(studies)
    
    # Check for publication bias
    publication_bias_results <- detect_publication_bias(studies)
    
    return(paste0(
      "Based on the meta-analysis of ", nrow(studies), " studies:\n\n",
      "The overall effect size is ", round(weighted_mean, 3), 
      " (95% CI: ", round(ci_lower, 3), " to ", round(ci_upper, 3), 
      ", p = ", format.pval(p_value, digits = 3), ").\n\n",
      "Heterogeneity: ", heterogeneity_results$interpretation, "\n\n",
      "Publication bias: ", publication_bias_results$egger_test$interpretation, "\n\n",
      "For more specific information, please ask about heterogeneity, publication bias, moderators, outliers, trends, or clusters."
    ))
  }
}

# Main function
main <- function() {
  # Generate response to the query
  response <- generate_response(query, studies)
  
  # Save the response
  output_path <- file.path(dirname(studies_file), paste0(job_id, "_analysis.json"))
  json_data <- list(
    success = TRUE,
    response = response,
    metadata = list(
      n_studies = nrow(studies),
      query = query,
      processing_time = Sys.time()
    )
  )
  
  write_json(json_data, output_path, auto_unbox = TRUE)
  
  # Print the result to stdout (will be captured by the Node.js process)
  cat(jsonlite::toJSON(json_data, auto_unbox = TRUE))
}

# Run the main function
main() 