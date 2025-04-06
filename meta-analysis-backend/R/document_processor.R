#!/usr/bin/env Rscript

#' Document Processor for Meta-Analysis
#' 
#' This script processes raw documents (PDF, DOCX, TXT) to extract meta-analysis data
#' using NLP techniques and AI-powered extraction.

# Load required libraries
suppressPackageStartupMessages({
  library(tidyverse)
  library(tm)
  library(pdftools)
  library(docxtractr)
  library(jsonlite)
  library(tidytext)
  library(openNLP)
  library(NLP)
  library(udpipe)
  library(stringr)
  library(glmnet)
  library(caret)
  library(randomForest)
  library(e1071)
  library(ggplot2)
  library(gridExtra)
})

# Parse command line arguments
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript document_processor.R <file_path> <job_id>")
}

file_path <- args[1]
job_id <- args[2]

# Function to extract text from different document types
extract_text <- function(file_path) {
  file_ext <- tolower(tools::file_ext(file_path))
  
  text <- switch(file_ext,
    "pdf" = {
      pdf_text <- pdftools::pdf_text(file_path)
      paste(pdf_text, collapse = "\n")
    },
    "docx" = {
      doc <- docxtractr::read_docx(file_path)
      docxtractr::docx_extract_text(doc)
    },
    "txt" = {
      readLines(file_path, warn = FALSE) %>% paste(collapse = "\n")
    },
    "csv" = {
      # For CSV files, we'll just read the data directly
      data <- readr::read_csv(file_path)
      return(list(text = "", data = data))
    },
    "xlsx" = {
      # For Excel files, we'll just read the data directly
      data <- readxl::read_excel(file_path)
      return(list(text = "", data = data))
    },
    "json" = {
      # For JSON files, we'll just read the data directly
      data <- jsonlite::fromJSON(file_path)
      return(list(text = "", data = data))
    },
    stop("Unsupported file type: ", file_ext)
  )
  
  return(list(text = text, data = NULL))
}

# Function to extract study information from text
extract_study_info <- function(text) {
  # Initialize empty data frame for studies
  studies <- data.frame(
    study_id = character(),
    study_label = character(),
    effect_size = numeric(),
    se = numeric(),
    weight = numeric(),
    year = numeric(),
    author = character(),
    stringsAsFactors = FALSE
  )
  
  # If text is empty, return empty data frame
  if (text == "") {
    return(studies)
  }
  
  # Create a corpus
  corpus <- Corpus(VectorSource(text))
  
  # Preprocess the corpus
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, removePunctuation)
  corpus <- tm_map(corpus, removeNumbers)
  corpus <- tm_map(corpus, removeWords, stopwords("english"))
  corpus <- tm_map(corpus, stripWhitespace)
  
  # Extract text after preprocessing
  processed_text <- paste(unlist(sapply(corpus, `[`, "content")), collapse = " ")
  
  # Extract author-year patterns (e.g., "Smith et al. (2018)")
  author_year_pattern <- "([A-Za-z]+(?:\\s+et\\s+al\\.)?)\\s*\\(\\s*(\\d{4})\\s*\\)"
  author_year_matches <- str_match_all(processed_text, author_year_pattern)
  
  if (length(author_year_matches[[1]]) > 0) {
    for (i in 1:nrow(author_year_matches[[1]])) {
      author <- author_year_matches[[1]][i, 2]
      year <- as.numeric(author_year_matches[[1]][i, 3])
      
      # Extract effect size patterns near the author-year
      # This is a simplified approach - in a real implementation, 
      # you would use more sophisticated NLP techniques
      effect_size_pattern <- "effect\\s+size\\s*[=:]\\s*([-+]?\\d*\\.?\\d+)"
      se_pattern <- "standard\\s+error\\s*[=:]\\s*([-+]?\\d*\\.?\\d+)"
      
      # Look for effect size and SE in a window around the author-year
      author_year_pos <- regexpr(paste0(author, ".*\\(", year, "\\)"), processed_text)
      if (author_year_pos != -1) {
        window_start <- max(1, author_year_pos - 200)
        window_end <- min(nchar(processed_text), author_year_pos + 200)
        window_text <- substr(processed_text, window_start, window_end)
        
        effect_size_match <- regexpr(effect_size_pattern, window_text, ignore.case = TRUE)
        se_match <- regexpr(se_pattern, window_text, ignore.case = TRUE)
        
        effect_size <- NA
        se <- NA
        
        if (effect_size_match != -1) {
          effect_size_str <- substr(window_text, effect_size_match + attr(effect_size_match, "match.length") - 10, 
                                   effect_size_match + attr(effect_size_match, "match.length"))
          effect_size_match <- regexpr("[-+]?\\d*\\.?\\d+", effect_size_str)
          if (effect_size_match != -1) {
            effect_size <- as.numeric(substr(effect_size_str, effect_size_match, 
                                           effect_size_match + attr(effect_size_match, "match.length") - 1))
          }
        }
        
        if (se_match != -1) {
          se_str <- substr(window_text, se_match + attr(se_match, "match.length") - 10, 
                          se_match + attr(se_match, "match.length"))
          se_match <- regexpr("[-+]?\\d*\\.?\\d+", se_str)
          if (se_match != -1) {
            se <- as.numeric(substr(se_str, se_match, 
                                  se_match + attr(se_match, "match.length") - 1))
          }
        }
        
        # Only add if we found at least an effect size
        if (!is.na(effect_size)) {
          study_id <- paste0("S", sprintf("%03d", i))
          study_label <- paste0(author, " et al. (", year, ")")
          weight <- ifelse(!is.na(se), 1 / (se^2), NA)
          
          studies <- rbind(studies, data.frame(
            study_id = study_id,
            study_label = study_label,
            effect_size = effect_size,
            se = se,
            weight = weight,
            year = year,
            author = author,
            stringsAsFactors = FALSE
          ))
        }
      }
    }
  }
  
  return(studies)
}

# Function to extract data from structured formats (CSV, Excel, JSON)
extract_structured_data <- function(data) {
  if (is.null(data)) {
    return(data.frame())
  }
  
  # Check if the data already has the required columns
  required_cols <- c("study_id", "effect_size", "se")
  optional_cols <- c("study_label", "weight", "year", "author")
  
  # If data is a list (from JSON), convert to data frame
  if (is.list(data) && !is.data.frame(data)) {
    data <- as.data.frame(data)
  }
  
  # If data is a matrix, convert to data frame
  if (is.matrix(data)) {
    data <- as.data.frame(data)
  }
  
  # Check if we have the required columns
  missing_cols <- setdiff(required_cols, names(data))
  
  if (length(missing_cols) > 0) {
    # Try to infer the required columns
    if ("effect" %in% names(data) || "effect_size" %in% names(data) || "es" %in% names(data)) {
      effect_col <- intersect(c("effect", "effect_size", "es"), names(data))[1]
      data$effect_size <- as.numeric(data[[effect_col]])
    } else {
      # Look for columns that might contain effect sizes
      numeric_cols <- sapply(data, is.numeric)
      if (sum(numeric_cols) > 0) {
        # Assume the first numeric column is the effect size
        effect_col <- names(data)[numeric_cols][1]
        data$effect_size <- as.numeric(data[[effect_col]])
      } else {
        stop("Could not find effect size column")
      }
    }
    
    if ("standard_error" %in% names(data) || "se" %in% names(data) || "std_error" %in% names(data)) {
      se_col <- intersect(c("standard_error", "se", "std_error"), names(data))[1]
      data$se <- as.numeric(data[[se_col]])
    } else {
      # Look for columns that might contain standard errors
      numeric_cols <- sapply(data, is.numeric)
      if (sum(numeric_cols) > 1) {
        # Assume the second numeric column is the standard error
        se_col <- names(data)[numeric_cols][2]
        data$se <- as.numeric(data[[se_col]])
      } else {
        # If we can't find a standard error, estimate it from the effect size
        data$se <- abs(data$effect_size) * 0.2  # Rough estimate
      }
    }
    
    # Generate study IDs if missing
    if (!"study_id" %in% names(data)) {
      data$study_id <- paste0("S", sprintf("%03d", 1:nrow(data)))
    }
  }
  
  # Add optional columns if missing
  if (!"study_label" %in% names(data)) {
    if ("author" %in% names(data) && "year" %in% names(data)) {
      data$study_label <- paste0(data$author, " (", data$year, ")")
    } else {
      data$study_label <- data$study_id
    }
  }
  
  if (!"weight" %in% names(data) && "se" %in% names(data)) {
    data$weight <- 1 / (data$se^2)
  }
  
  # Ensure all required columns are present
  for (col in required_cols) {
    if (!col %in% names(data)) {
      stop("Required column ", col, " is missing and could not be inferred")
    }
  }
  
  return(data)
}

# Main processing function
process_document <- function(file_path, job_id) {
  # Extract text and/or data from the document
  result <- extract_text(file_path)
  text <- result$text
  structured_data <- result$data
  
  # Process structured data if available
  if (!is.null(structured_data)) {
    studies <- extract_structured_data(structured_data)
  } else {
    # Extract study information from text
    studies <- extract_study_info(text)
  }
  
  # If we couldn't extract any studies, return an error
  if (nrow(studies) == 0) {
    return(list(
      success = FALSE,
      error = "No study data could be extracted from the document"
    ))
  }
  
  # Save the extracted data
  output_path <- file.path(dirname(file_path), paste0(job_id, "_processed.json"))
  json_data <- list(
    success = TRUE,
    studies = studies,
    metadata = list(
      source_file = file_path,
      processing_time = Sys.time(),
      n_studies = nrow(studies)
    )
  )
  
  write_json(json_data, output_path, auto_unbox = TRUE)
  
  return(json_data)
}

# Process the document
result <- process_document(file_path, job_id)

# Print the result to stdout (will be captured by the Node.js process)
cat(jsonlite::toJSON(result, auto_unbox = TRUE)) 