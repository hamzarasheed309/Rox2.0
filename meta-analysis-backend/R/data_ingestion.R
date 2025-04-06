#' Data Ingestion and Preprocessing Module
#' 
#' This module handles loading data from various sources and preprocessing it
#' for meta-analysis.

library(tidyverse)
library(readxl)
library(jsonlite)
library(lubridate)
library(mice)  # For imputation

#' Load data from various file formats
#' 
#' @param file_path Path to the data file
#' @param file_type Optional file type override (auto-detected if NULL)
#' @return A tibble containing the loaded data
#' @export
load_data <- function(file_path, file_type = NULL) {
  if (is.null(file_type)) {
    file_type <- tolower(tools::file_ext(file_path))
  }
  
  data <- switch(file_type,
    "csv" = readr::read_csv(file_path, na = c("", "NA", "N/A")),
    "xlsx" = readxl::read_excel(file_path, na = c("", "NA", "N/A")),
    "xls" = readxl::read_excel(file_path, na = c("", "NA", "N/A")),
    "json" = jsonlite::fromJSON(file_path, flatten = TRUE) %>% as_tibble(),
    "rds" = readRDS(file_path),
    stop("Unsupported file type: ", file_type)
  )
  
  # Add metadata
  attr(data, "source_file") <- file_path
  attr(data, "import_time") <- Sys.time()
  
  return(data)
}

#' Load data from API
#' 
#' @param api_url URL of the API endpoint
#' @param params List of parameters to send with the request
#' @param auth_token Optional authentication token
#' @return A tibble containing the loaded data
#' @export
load_data_from_api <- function(api_url, params = list(), auth_token = NULL) {
  headers <- list()
  if (!is.null(auth_token)) {
    headers <- c(headers, Authorization = paste("Bearer", auth_token))
  }
  
  response <- httr::GET(
    url = api_url,
    query = params,
    httr::add_headers(.headers = headers)
  )
  
  httr::stop_for_status(response)
  
  content <- httr::content(response, "text", encoding = "UTF-8")
  data <- jsonlite::fromJSON(content, flatten = TRUE) %>% as_tibble()
  
  # Add metadata
  attr(data, "source_api") <- api_url
  attr(data, "import_time") <- Sys.time()
  
  return(data)
}

#' Validate meta-analysis data structure
#' 
#' @param data Tibble containing the data
#' @param required_columns Vector of column names that must be present
#' @return Logical indicating if the data is valid
#' @export
validate_data_structure <- function(data, required_columns = NULL) {
  if (is.null(required_columns)) {
    # Default required columns for meta-analysis
    required_columns <- c("study_id", "effect_size", "se")
  }
  
  missing_columns <- setdiff(required_columns, names(data))
  
  if (length(missing_columns) > 0) {
    warning("Missing required columns: ", paste(missing_columns, collapse = ", "))
    return(FALSE)
  }
  
  return(TRUE)
}

#' Preprocess data for meta-analysis
#' 
#' @param data Tibble containing the raw data
#' @param effect_size_type Type of effect size ("OR", "RR", "SMD", etc.)
#' @param missing_data_strategy Strategy for handling missing data
#' @return Preprocessed tibble ready for meta-analysis
#' @export
preprocess_data <- function(data, effect_size_type = "OR", 
                           missing_data_strategy = "listwise_deletion") {
  # Make a copy to avoid modifying the original
  processed_data <- data %>% as_tibble()
  
  # Handle missing data
  if (missing_data_strategy == "listwise_deletion") {
    processed_data <- processed_data %>% 
      drop_na(any_of(c("effect_size", "se")))
  } else if (missing_data_strategy == "mean_imputation") {
    for (col in c("effect_size", "se")) {
      if (col %in% names(processed_data)) {
        col_mean <- mean(processed_data[[col]], na.rm = TRUE)
        processed_data <- processed_data %>%
          mutate(!!col := ifelse(is.na(!!sym(col)), col_mean, !!sym(col)))
      }
    }
  } else if (missing_data_strategy == "multiple_imputation") {
    # Use mice package for multiple imputation
    imp <- mice(processed_data, m = 5, printFlag = FALSE)
    processed_data <- complete(imp, 1)  # Use the first imputed dataset
  }
  
  # Convert effect size if needed
  if (effect_size_type == "OR" && "log_odds_ratio" %in% names(processed_data)) {
    processed_data <- processed_data %>%
      mutate(effect_size = exp(log_odds_ratio))
  } else if (effect_size_type == "OR" && all(c("events_treatment", "n_treatment", "events_control", "n_control") %in% names(processed_data))) {
    processed_data <- processed_data %>%
      mutate(
        effect_size = (events_treatment / (n_treatment - events_treatment)) / 
                     (events_control / (n_control - events_control)),
        log_effect_size = log(effect_size),
        se = sqrt(1/events_treatment + 1/(n_treatment - events_treatment) + 
                 1/events_control + 1/(n_control - events_control))
      )
  }
  
  # Add study labels if missing
  if (!"study_label" %in% names(processed_data)) {
    if ("author" %in% names(processed_data) && "year" %in% names(processed_data)) {
      processed_data <- processed_data %>%
        mutate(study_label = paste0(author, " (", year, ")"))
    } else {
      processed_data <- processed_data %>%
        mutate(study_label = paste0("Study ", row_number()))
    }
  }
  
  # Add study weights column if not present
  if (!"weight" %in% names(processed_data) && all(c("effect_size", "se") %in% names(processed_data))) {
    processed_data <- processed_data %>%
      mutate(weight = 1 / (se^2))
  }
  
  # Add metadata
  attr(processed_data, "effect_size_type") <- effect_size_type
  attr(processed_data, "preprocessing_time") <- Sys.time()
  
  return(processed_data)
}

#' Convert between different effect size measures
#' 
#' @param data Tibble containing the data
#' @param from Current effect size measure
#' @param to Target effect size measure
#' @return Tibble with converted effect sizes
#' @export
convert_effect_size <- function(data, from = "OR", to = "RR") {
  # Implementation of various effect size conversions
  # This is a simplified version - actual implementation would be more comprehensive
  
  if (from == to) {
    return(data)
  }
  
  converted_data <- data
  
  if (from == "OR" && to == "logOR") {
    converted_data <- data %>%
      mutate(
        effect_size = log(effect_size),
        se = se / effect_size  # Delta method approximation
      )
  } else if (from == "logOR" && to == "OR") {
    converted_data <- data %>%
      mutate(
        effect_size = exp(effect_size),
        se = se * effect_size  # Delta method approximation
      )
  } else if (from == "OR" && to == "RR" && 
            all(c("events_treatment", "n_treatment", "events_control", "n_control") %in% names(data))) {
    # Need raw data to convert between OR and RR accurately
    converted_data <- data %>%
      mutate(
        p_c = events_control / n_control,
        p_t = events_treatment / n_treatment,
        effect_size = p_t / p_c,  # RR
        se = sqrt((1 - p_t)/(p_t * n_treatment) + (1 - p_c)/(p_c * n_control))
      ) %>%
      select(-p_c, -p_t)
  } else if (from == "SMD" && to == "logOR") {
    # Convert standardized mean difference to log odds ratio
    # Using the approximation: logOR ≈ (π/√3) * SMD
    converted_data <- data %>%
      mutate(
        effect_size = (pi / sqrt(3)) * effect_size,
        se = (pi / sqrt(3)) * se
      )
  } else {
    stop("Conversion from ", from, " to ", to, " is not implemented or requires additional data")
  }
  
  # Update metadata
  attr(converted_data, "effect_size_type") <- to
  
  return(converted_data)
}

#' Detect outliers in meta-analysis data
#' 
#' @param data Tibble containing the data
#' @param method Method for outlier detection
#' @param threshold Threshold for outlier detection
#' @return Tibble with outlier indicators
#' @export
detect_outliers <- function(data, method = "z_score", threshold = 3) {
  if (method == "z_score") {
    data <- data %>%
      mutate(
        effect_size_z = (effect_size - mean(effect_size, na.rm = TRUE)) / sd(effect_size, na.rm = TRUE),
        is_outlier = abs(effect_size_z) > threshold
      )
  } else if (method == "iqr") {
    q1 <- quantile(data$effect_size, 0.25, na.rm = TRUE)
    q3 <- quantile(data$effect_size, 0.75, na.rm = TRUE)
    iqr <- q3 - q1
    
    data <- data %>%
      mutate(
        is_outlier = effect_size < (q1 - threshold * iqr) | effect_size > (q3 + threshold * iqr)
      )
  }
  
  return(data)
} 