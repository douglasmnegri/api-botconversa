function getProposal(
  unitCost,
  finalCost,
  installmentNumber,
  installmentPrice,
  creditCardPrice
) {
  const unitCostText = document.querySelectorAll(".unit-content");
  const finalCostText = document.querySelector(".total-content");
  const installmentText = document.querySelector(".installment-content");
  const installmentPriceText = document.querySelector(".installment-price-content");
  const creditCardText = document.querySelector(".credit-card-content");
  unitCostText.forEach((element) => {
    element.textContent = `R$ ${unitCost},00`;
  });
  finalCostText.textContent = `R$ ${finalCost},00`;
  installmentText.textContent = `Em até ${installmentNumber}x s/ juros`;
  installmentPriceText.textContent = `R$ ${installmentPrice},00`;
  creditCardText.textContent = `R$ ${creditCardPrice},00`;
}

getProposal(30, "3.000", 10, 270, "2.700");
