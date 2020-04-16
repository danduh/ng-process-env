export const environment = {
  <%= environmentFilesMerger() %>,
  envVar: {
    /**
     * Add environment variables you want to retriev from process
     * PORT:4200,
     * VAR_NAME: defaultValue
     */
  }
};
