function getProposal(
  unitCostCash,
  finalCost,
  installmentNumber,
  installmentPrice,
  creditCardPrice,
  unitCostCard
) {
  const unitCostCashText = document.querySelector(".unit-cash-content");
  const finalCostText = document.querySelector(".total-content");
  const installmentText = document.querySelector(".installment-content");
  const installmentPriceText = document.querySelector(
    ".installment-price-content"
  );
  const creditCardText = document.querySelector(".credit-card-content");
  const unitCostCardText = document.querySelector(".unit-card-content");

  unitCostCashText.textContent = `R$ ${unitCostCash},00`;
  finalCostText.textContent = `R$ ${finalCost},00`;
  installmentText.textContent = `Em até ${installmentNumber}x sem juros`;
  installmentPriceText.textContent = `R$ ${installmentPrice},00`;
  creditCardText.textContent = `R$ ${creditCardPrice},00`;
  unitCostCardText.textContent = `R$ ${unitCostCard},00`;
}
