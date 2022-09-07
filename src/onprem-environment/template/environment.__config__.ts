export const environment = {
  <%= environmentFilesMerger() %>,
  envVar: {
    /**
     * Add environment variables you want to retrieve from process
     * PORT:4200,
     * VAR_NAME: defaultValue
     */
  }
};
