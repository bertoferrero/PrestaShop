// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
// Import BO pages
import dashboardPage from '@pages/BO/dashboard';
import generalPage from '@pages/BO/shopParameters/general';
import brandsPage from '@pages/BO/catalog/brands';
import suppliersPage from '@pages/BO/catalog/suppliers';
// Import FO pages
import {homePage} from '@pages/FO/home';
import {siteMapPage} from '@pages/FO/siteMap';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_BO_shopParameters_general_general_enableDisableSuppliers';

/*
Enable/Disable suppliers
Check the alert message from BO Suppliers page
Go to FO to check suppliers link in sitemap page
 */
describe('BO - Shop Parameters - General : Enable/Disable display suppliers', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  const tests = [
    {args: {action: 'enable', exist: true}},
    {args: {action: 'disable', exist: false}},
  ];

  tests.forEach((test, index: number) => {
    it('should go to \'Shop parameters > General\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goToGeneralPage_${index}`, baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.shopParametersParentLink,
        dashboardPage.shopParametersGeneralLink,
      );
      await generalPage.closeSfToolBar(page);

      const pageTitle = await generalPage.getPageTitle(page);
      await expect(pageTitle).to.contains(generalPage.pageTitle);
    });

    it(`should ${test.args.action} display suppliers`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `${test.args.action}DisplaySuppliers`, baseContext);

      const result = await generalPage.setDisplaySuppliers(page, test.args.exist);
      await expect(result).to.contains(generalPage.successfulUpdateMessage);
    });

    it('should go to \'Brands & Suppliers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goToBrandsPage_${index}`, baseContext);

      await generalPage.goToSubMenu(
        page,
        generalPage.catalogParentLink,
        generalPage.brandsAndSuppliersLink,
      );

      const pageTitle = await brandsPage.getPageTitle(page);
      await expect(pageTitle).to.contains(brandsPage.pageTitle);
    });

    it('should go to \'Suppliers\' tab', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goToSuppliersTab_${index}`, baseContext);

      await brandsPage.goToSubTabSuppliers(page);

      const pageTitle = await suppliersPage.getPageTitle(page);
      await expect(pageTitle).to.contains(suppliersPage.pageTitle);
    });

    it(`should check that the message alert contains '${test.args.action}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `checkAlertContains_${test.args.action}`, baseContext);

      const text = await suppliersPage.getAlertInfoBlockParagraphContent(page);
      await expect(text).to.contains(test.args.action);
    });

    it('should go to FO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goToFO_${test.args.action}`, baseContext);

      // View shop
      page = await suppliersPage.viewMyShop(page);
      // Change shop language
      await homePage.changeLanguage(page, 'en');

      const isHomePage = await homePage.isHomePage(page);
      await expect(isHomePage).to.be.true;
    });

    it('should verify the existence of the suppliers page link', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `checkSuppliersPage_${test.args.action}`, baseContext);

      await homePage.goToFooterLink(page, 'Sitemap');

      const pageTitle = await siteMapPage.getPageTitle(page);
      await expect(pageTitle).to.equal(siteMapPage.pageTitle);

      const exist = await siteMapPage.isSuppliersLinkVisible(page);
      await expect(exist).to.be.equal(test.args.exist);
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goBackToBo_${test.args.action}`, baseContext);

      page = await siteMapPage.closePage(browserContext, page, 0);

      const pageTitle = await suppliersPage.getPageTitle(page);
      await expect(pageTitle).to.contains(suppliersPage.pageTitle);
    });
  });
});
