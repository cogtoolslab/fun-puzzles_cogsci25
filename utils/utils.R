
set.seed(12341)

# plots template

apa_theme <- theme(
  plot.margin = unit(c(0.5, 0.5, 0.5, 0.5), "cm"),
  plot.background = element_rect(fill = "white", color = NA),
  plot.title = element_text(
    size = 11, face = "bold",
    hjust = 0.5,
    margin = margin(b = 15)
  ),
  axis.line = element_line(color = "black", linewidth = .5),
  axis.title = element_text(
    size = 14, color = "black",
    face = "bold",
    # family="Avenir"
  ),
  axis.text = element_text(size = 9, color = "black"),
  axis.text.x = element_text(margin = margin(t = 5)),
  axis.title.y = element_text(margin = margin(r = 5)),
  axis.ticks = element_line(size = .5),
  strip.text = element_text(size=11, color="black"),
  panel.grid = element_blank(),
  legend.position = "right",
  legend.title = element_blank(),
  legend.background = element_rect(color = "black"),
  legend.text = element_text(size = 10),
  legend.margin = margin(t = 5, l = 5, r = 5, b = 5),
  legend.key = element_rect(color = NA, fill = NA)
)

theme_set(theme_minimal(base_size = 12) +
            apa_theme)

# Custom formatting fucntion
format_pval <- function(pval) {
  pval <- scales::pvalue(pval, accuracy = 0.0001, add_p = TRUE)
  gsub(pattern = "(=|<)", replacement = " \\1 ", x = pval)
}

CONDITION_COLORS = c("enjoyable"="#F55FAA7C", "difficult" ="#336CE8")

MYCOLORS = c("difficult" = "#56B4E9", "enjoyable" = "#E69F00")
MYCOLORS_dark = c('enjoyable' = "#e78ac3", 'difficult' = "#1f78b4")
MYCOLORS_light = c('enjoyable' = "#e9a3c9", 'difficult' = "#56B4E9")

tiles = c('#c0e5f2','#006083', '#eed193')
manycolors = c("#c51b7d", "#e9a3c9", "#a1d76a", "#4d9221",
               "#a6611a", "#dfc27d", "#80cdc1", "#018571",
               "#E69F00")

# Make a helper function for calculating mean, median, sd, se

summarizer <- function(data, target_cols = NULL, ...) {
  data %>%
    group_by(...) %>%
    summarise(across({{target_cols}}, list(
      mean = ~mean(.x, na.rm = TRUE),
      median = ~median(.x, na.rm = TRUE),
      sd = ~sd(.x, na.rm = TRUE)
      # se = ~papaja::se(.x, na.rm = TRUE)
      # q05 = ~quantile(.x, 0.05, na.rm = TRUE),
      # q95 = ~quantile(.x, 0.95, na.rm = TRUE)
    ), .names = "{col}_{fn}")) %>%
    ungroup()
}

## stats functions for nested dfs ----

cor_function <- function(df, x, y, r_method="pearson") {
  # cor.test(df$rating_mean, df$value, method = r_method) %>%
  cor.test(df[[x]], df[[y]], method = r_method) %>%
    tidy()
}

lm_1_function <- function(df) {
  lm(y ~ x, data=df)
}


lm_summary <- function(model) {
  cbind(glance(model),
        as.data.frame(performance::r2_nakagawa(model)) %>%
          select(-optional))
}


lme_1_function <- function(df, reml=FALSE) {
  lmer(y ~ x + (1|puzzle_id) + (1|gameID), 
       data=df,
       REML=reml)
}


lme_2_function <- function(df, reml=FALSE) {
  lmer(y ~ x * study_phase + (1|puzzle_id) + (1|gameID), 
       data=df,
       REML=reml)
}


lme_summary <- function(model) {
  cbind(glance(model),
        as.data.frame(performance::r2_nakagawa(model)) %>%
          select(-optional))
}


## unscale
un_zscale <- function(x, scaled_term){
  # collect mean and standard deviation from scaled covariate
  att <- attributes(scaled_term)
  mu <- att$`scaled:center`
  sd <- att$`scaled:scale`
  # reverse the z-transformation
  answer <- (x * sd) + mu
  # # this value will have a name, remove it
  #  names(answer) <- NULL
  # return unscaled coef
  return(answer)
}

re_zscale <- function(x, scaled_term){
  # collect mean and standard deviation from scaled covariate
  att <- attributes(scaled_term)
  mu <- att$`scaled:center`
  sd <- att$`scaled:scale`
  # reverse the z-transformation
  answer <- (x - mu) / sd
  # # this value will have a name, remove it
  #  names(answer) <- NULL
  # return unscaled coef
  return(answer)
}

## ELO ----

make_elo_diff <- function(df, nruns = nRuns_elo_permute, print_summary=F) {
  result <- elochoice(
    winner = df$chosen,
    loser = df$unchosen, runs = nruns
  )
  if (print_summary) {
    summary(result)
  }
  return(result)
}

make_elo_summary <- function(elo_diff) {
  temp <- elo_diff$ratmat
  range <- apply(temp, MARGIN = 2, FUN = range, na.rm = TRUE) # range of elo
  rownames(range) <- c("min", "max")
  elo <- temp[1, ] # elo from original trial order
  mElo <- colMeans(temp, na.rm = T) # mean elo from randomizations
  sdElo <- apply(temp, 2, sd, na.rm = T) # sd of elo
  
  temp2 <- rbind(elo, mElo, sdElo, range) %>% t()
  myDF <- data.frame(temp2) %>% rownames_to_column("puzzle_id")
  return(myDF)
}