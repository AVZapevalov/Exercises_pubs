const serviceUrlProvider = require('@viaplay/serviceurlprovider')();


module.exports = function (renderPage, productServiceThePlatform, settings, log) {
   const urlManager = require('@viaplay/urlmanager').injectLog(log);
  
   function createSectionUrl(deviceKey, sitemap, requestData) {
       return urlManager.compileUrl(serviceUrlProvider.content.public.tld(requestData.getTLD(deviceKey)).home, deviceKey, sitemap.getActiveSection().path);
   }

   return {
       constructPage (deviceKey, requestData, routeData, sitemap, cookies, callback) {
           var sitemapBlocks = sitemap.getArticlePageBlocksByProduct(routeData.product);
           renderPage(deviceKey, requestData, routeData, sitemap, sitemapBlocks, cookies, callback);
       }, /* func */
  
       constructFirstEpisodeUrl (deviceKey, requestData, routeData, sitemap, queryParams, callback) {
           var getProductParams = {
               deviceKey: deviceKey,
               feed: settings.thePlatform.episodeFeed,
               sort: 'seriesEpisodeNumber|asc',
               seriesId: routeData.product.system.thePlatform.programId,
               requestData
           };
           if (requestData.hasGlobalFilterParams()) {
               getProductParams.filterFlag = requestData.getGlobalFilterParamsString();
           }
           productServiceThePlatform.getProducts(getProductParams, requestData, null, function (productError, productResponse) {
               if (!productResponse || !productResponse.products || productResponse.products.length === 0) {
                   log.warning('Could not find first episode for series', {'params': getProductParams});
                   callback(createSectionUrl(deviceKey, sitemap, requestData));
                   return;
               }
               urlManager.compileRedirectProductUrl(serviceUrlProvider.content.public.tld(requestData.getTLD(deviceKey)).home, deviceKey, sitemap.getActiveSection().path, productResponse.products[0], queryParams, false, function (href) {
                   if (!href) {
                       log.error('Could not create URL for product', {product: productResponse.products[0]});
                       href = createSectionUrl(deviceKey, sitemap, requestData);
                   }
                   callback(href);
               });
           });
       } /* func */
   };
};
