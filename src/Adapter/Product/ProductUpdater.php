<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

declare(strict_types=1);

namespace PrestaShop\PrestaShop\Adapter\Product;

use PrestaShop\PrestaShop\Adapter\AbstractObjectModelUpdater;
use PrestaShop\PrestaShop\Core\Domain\Product\Customization\ValueObject\CustomizationFieldType;
use PrestaShop\PrestaShop\Core\Domain\Product\Exception\CannotUpdateProductException;
use PrestaShop\PrestaShop\Core\Domain\Product\ProductCustomizabilitySettings;
use PrestaShop\PrestaShop\Core\Exception\CoreException;
use Product;

/**
 * Performs update of provided Product properties
 */
class ProductUpdater extends AbstractObjectModelUpdater
{
    /**
     * @var ProductValidator
     */
    private $productValidator;

    /**
     * @param ProductValidator $productValidator
     */
    public function __construct(
        ProductValidator $productValidator
    ) {
        $this->productValidator = $productValidator;
    }

    /**
     * @param Product $product
     * @param array $propertiesToUpdate
     * @param int $errorCode
     *
     * @throws CoreException
     */
    public function update(Product $product, array $propertiesToUpdate, int $errorCode): void
    {
        $this->fillProperties($product, $propertiesToUpdate);
        $this->productValidator->validate($product);
        $this->updateObjectModel($product, CannotUpdateProductException::class, $errorCode);
    }

    /**
     * @param Product $product
     */
    public function refreshProductCustomizabilityFields(Product $product): void
    {
        if ($product->hasActivatedRequiredCustomizableFields()) {
            $product->customizable = ProductCustomizabilitySettings::REQUIRES_CUSTOMIZATION;
        } elseif (!empty($product->getNonDeletedCustomizationFieldIds())) {
            $product->customizable = ProductCustomizabilitySettings::ALLOWS_CUSTOMIZATION;
        } else {
            $product->customizable = ProductCustomizabilitySettings::NOT_CUSTOMIZABLE;
        }

        $product->text_fields = $product->countCustomizationFields(CustomizationFieldType::TYPE_TEXT);
        $product->uploadable_files = $product->countCustomizationFields(CustomizationFieldType::TYPE_FILE);

        $product->addFieldsToUpdate([
            'customizable' => true,
            'text_fields' => true,
            'uploadable_files' => true,
        ]);
    }

    /**
     * @param Product $customizationField
     * @param array $propertiesToUpdate
     */
    private function fillProperties(Product $customizationField, array $propertiesToUpdate): void
    {
        $this->fillProperty($customizationField, 'customizable', $propertiesToUpdate);
        $this->fillProperty($customizationField, 'text_fields', $propertiesToUpdate);
        $this->fillProperty($customizationField, 'uploadable_files', $propertiesToUpdate);
        //@todo; more properties when refactoring other handlers to use updater/validator
    }
}
