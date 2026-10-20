// §10.6 "Calibration explorer". Strings from the spec say where they come
// from; the ones marked "New" still need Tanishq's approval. Every number comes from Appendix B (@content/charts).

export const forecastingCopy = {
  // Phase 4's figure caption.
  caption:
    "Observed against nominal coverage of the forecast intervals on the test set, at nine levels. Lines below the diagonal are overconfident: their intervals are too narrow.",
  // New: the tab list's name and the first tab; "Recalibration" is §10.6.
  tabs: {
    label: "Calibration explorer",
    calibration: "Calibration",
    recalibration: "Recalibration",
  },
  // New: the seed picker's legend. "Mean of 5" and "computed" are §10.6.
  seeds: "DeepAR seed",
  mean: "Mean of 5",
  computed: "computed",
  seed: "seed",
  // §10.6 and the Phase 4 diagram.
  diagram: "Reliability diagram: observed against nominal interval coverage",
  axes: { x: "Nominal coverage", y: "Observed coverage" },
  below: "Overconfident",
  models: {
    seasonal_naive: "Seasonal naive",
    arima: "ARIMA",
    ets: "ETS",
    deepar: "DeepAR",
  },
  // §10.6 metric cards; A.4.6 table headers.
  cards: { crps: "CRPS", rmse: "RMSE", cov90: "90% coverage", ece: "ECE" },
  // New: the cards' heading for the 5-seed row (A.4.6: "mean ± sd over 5 seeds").
  meanTitle: "mean ± sd over 5 seeds",
  // New: the horizon bars' heading; the row label is Phase 4's.
  horizon: "ECE by forecast horizon · best seed",
  ahead: "h ahead",
  // New: the Recalibration tab. "before/after … from the same run" is §10.6;
  // the method is A.4.6's.
  recal: {
    title: "Isotonic recalibration, fitted on the validation period",
    sub: "Before and after, on the same run",
    metric: "Metric",
    before: "Before",
    after: "After",
    rows: {
      test_ece: "Test ECE",
      val_ece: "Validation ECE",
      cov90: "90% coverage",
      crps: "CRPS",
      width90: "90% interval width",
    },
    oracle: "Test-period fit (diagnostic)",
    // A.4.6, with the value from Appendix B.
    oracleNote:
      "A fit on the test period itself reaches {value}. The method works; the shift is the problem.",
  },
  // §10.6, exactly.
  definition:
    "ECE here is the average gap between nominal and observed interval coverage across nine levels.",
} as const;

export type ForecastingCopy = typeof forecastingCopy;
