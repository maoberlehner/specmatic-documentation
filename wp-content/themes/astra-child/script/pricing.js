// @ts-nocheck
document.addEventListener("DOMContentLoaded", function () {
  // Selectors
  const planCards = document.querySelectorAll(".specmatic-user-type-card");
  const pricingForm = document.getElementById("pricing-form");
  const inputContainers = document.querySelectorAll(".input-container");
  const pricingPlansContainer = document.querySelector(
    "#pricing-plans-container"
  );
  const sliders = document.querySelectorAll(".spec-slider");
  const checkboxes = document.querySelectorAll('input[name="spec"]');
  const allInputs = document.querySelectorAll("input");
  const pricingSignUpButtons = document.querySelectorAll(
    ".price-plan-card .pricing-cta-btn"
  );
  const selectButtons = document.querySelectorAll(".select-btn");

  const teamPlanBasePrice = 100;
  const orgPlanBasePrice = 1000;

  const apiSpecs = {
    "no-spec": 0,
    "open-api-spec": 0,
    "wdsl-spec": 0,
    "async-api-spec": 150,
    "resp-spec": 50,
    "jdbc-spec": 50,
  };

  function toggleActivePlan(card) {
    planCards.forEach((card) => card.classList.remove("active-plan"));
    card.classList.add("active-plan");
    calculatePrice();
  }

  function toggleRecommendedPlan(planType) {
    const pricePlanCards = document.querySelectorAll(".price-plan-card");
    pricePlanCards.forEach((card) => card.classList.remove("recommended-plan"));

    const selectedPlan = document.getElementById(planType + "-plan");
    selectedPlan.classList.add("recommended-plan");

    const recommendedHeader = selectedPlan.querySelector(".recommended-header");
    recommendedHeader.style.display = "block";

    const otherPlanCards = document.querySelectorAll(
      ".price-plan-card:not(#" + planType + "-plan)"
    );
    otherPlanCards.forEach((card) => {
      const otherRecommendedHeader = card.querySelector(".recommended-header");
      otherRecommendedHeader.style.display = "none";
    });
  }

  function handleSlider(slider) {
    const output = slider.parentNode.querySelector(".slider-value");

    // Set the initial value of the tooltip to the default value of the slider
    output.innerHTML = slider.value;

    // Calculate the initial position of the tooltip
    const initialPercent =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    output.style.left = `calc(${initialPercent}% - (${
      output.offsetWidth / 2
    }px))`;
    slider.style.background = `linear-gradient(to right, #580089 0%, #580089 ${initialPercent}%, #ccc ${initialPercent}%, #ccc 100%)`;

    // Show the tooltip from the start
    output.classList.add("show");

    slider.oninput = function () {
      output.innerHTML = this.value;
      const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
      output.style.left = `calc(${percent}% - (${output.offsetWidth / 2}px))`;
      slider.style.background = `linear-gradient(to right, #580089 0%, #580089 ${percent}%, #ccc ${percent}%, #ccc 100%)`;
    };
  }

  // Event Listeners
  planCards.forEach((planCard) => {
    planCard.addEventListener("click", function () {
      toggleActivePlan(this);

      pricingForm.classList.add("active-form");

      const selectedPlanType = this.getAttribute("data-plan");
      document.getElementById("selected-plan-type").value = selectedPlanType;

      // If the data-plan attribute of the clicked card is not "self" then disable button with data-plan-name "Basic Plan" and enable the rest
      if (selectedPlanType !== "self") {
        selectButtons.forEach((button, index) => {
          button.disabled = index === 0;
        });
      } else {
        selectButtons.forEach((button) => {
          button.disabled = false;
        });
      }

      inputContainers.forEach(
        (container) => (container.style.display = "none")
      );
      inputContainers.forEach((container) => {
        if (container.getAttribute("data-plan").includes(selectedPlanType)) {
          container.style.display = "block";
        }
      });

      if (
        selectedPlanType &&
        pricingPlansContainer.classList.contains("pricing-plans-visible")
      ) {
        toggleRecommendedPlan(selectedPlanType);
      }

      const selfPlanClasses = document.getElementById("self-plan").classList;
      const selfPlanSignupClasses =
        document.getElementById("self-plan-signup").classList;
      if (selectedPlanType === "self") {
        const selfPlanDisabledSpecs = document.querySelectorAll(
          ".self-plan-disabled-spec"
        );
        selfPlanDisabledSpecs.forEach((spec) => {
          spec.disabled = true;
        });
        selfPlanClasses.remove("plan-unavailable");
        selfPlanSignupClasses.remove("plan-unavailable-btn");
      } else {
        checkboxes.forEach((checkbox) => {
          checkbox.disabled = false;
        });
        selfPlanClasses.add("plan-unavailable");
        selfPlanSignupClasses.add("plan-unavailable-btn");
      }
      document.getElementById("tell-us-more").style.display = "block";
      pricingPlansContainer.classList.remove("pricing-plans-hidden");
      pricingPlansContainer.classList.add("pricing-plans-visible");
      toggleRecommendedPlan(selectedPlanType);
      document
        .getElementById("spec-checkbox-grp")
        .scrollIntoView({ behavior: "smooth" });
    });
  });

  function intValue(el) {
    const val = parseInt(el.value || 1);
    return Math.max(val, 1);
  }

  function calculatePrice() {
    let teamSize = intValue(document.getElementById("team-size"));
    let teamCount = intValue(document.getElementById("team-count"));
    let apiCount = intValue(document.getElementById("api-count"));
    let buildCount = intValue(document.getElementById("build-count"));
    let apiSpecsSum = 0;

    otherCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        let id = checkbox.id;
        if (id in apiSpecs) {
          let value = apiSpecs[id];
          apiSpecsSum += value;
        }
      }
    });

    let teamPlanPrice = document.getElementById("pro-plan-price");
    let organizationPlanPrice = document.getElementById("organization-plan-price");

    const billableTeamSize = Math.max(teamSize, 10);
    const billableAPICount = Math.max(apiCount, 10);
    const billableBuildCount = Math.max(buildCount, 10);
    const billableTeamCount = Math.max(teamCount, 10);
    
    let tokenCount = billableTeamSize * billableAPICount * billableBuildCount;

    let logTokenPrice = Math.log(tokenCount) * 60;

    // Update team plan price
    teamPlanPrice.innerText = formatPrice(
      Math.ceil(teamPlanBasePrice + apiSpecsSum + logTokenPrice)
    );

    // Update organization plan price
    organizationPlanPrice.innerText = formatPrice(
      Math.ceil(orgPlanBasePrice + apiSpecsSum + (logTokenPrice * billableTeamCount))
    );
  }

  function formatPrice(price) {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });
  }

  // Add event listeners to all inputs so that the price is updated when the user changes the input
  allInputs.forEach((input) => {
    input.addEventListener("input", calculatePrice);
  });

  sliders.forEach(handleSlider);

  // Making sure that the "None" checkbox disables the other checkboxes and vice versa for API Spec checkboxes
  const noneCheckbox = document.getElementById("no-spec");
  const otherCheckboxes = document.querySelectorAll(
    'input[name="spec"]:not(#no-spec)'
  );

  noneCheckbox.addEventListener("change", function () {
    otherCheckboxes.forEach((checkbox) => {
      let teamType = document.getElementById("selected-plan-type").value;
      checkbox.disabled =
        noneCheckbox.checked ||
        (teamType === "self" &&
          checkbox.classList.contains("self-plan-disabled-spec"));
      if (noneCheckbox.checked) {
        checkbox.checked = false;
      }
    });
  });

  otherCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        noneCheckbox.checked = false;
        noneCheckbox.disabled = false;
      } else if (
        !Array.from(otherCheckboxes).some((checkbox) => checkbox.checked)
      ) {
        noneCheckbox.disabled = false;
      }
    });
  });

  pricingSignUpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const checkedOne = Array.prototype.slice
        .call(checkboxes)
        .some((x) => x.checked);
      if (!checkedOne) {
        document
          .getElementById("spec-checkbox-grp")
          .scrollIntoView({ behavior: "smooth" });
        alert("Please select at least one specification");
        return;
      }

      const personalInfoInputs = document.getElementById(
        "personal-info-inputs"
      );
      personalInfoInputs.classList.remove("hide-inputs");

      const signUpBtn = document.getElementById("sign-up-btn");
      const planName = button.getAttribute("data-plan-name");
      signUpBtn.setAttribute("data-plan-name", planName);
      personalInfoInputs.scrollIntoView({ behavior: "smooth" });
    });
  });

  selectButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      // Change the text of all buttons back to "Select"
      selectButtons.forEach((btn) => {
        btn.innerText = "Select";
      });

      // Change the text of the clicked button to a tick mark symbol and "Selected"
      button.innerText = "✓ Selected";
    });
  });
});
