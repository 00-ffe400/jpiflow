(() => {
  const section = document.querySelector("#pricing");
  if (!section) return;
  const prices = window.handoffPrices;
  const row = section.querySelector(".pr-row"),
    switcher = section.querySelector(".currency-switch");
  const list = section.querySelector(".pr-rate-list"),
    options = section.querySelector(".pr-seg"),
    retrieved = section.querySelector(".pr-snapshot");
  const currencies = [...switcher.querySelectorAll("[data-currency]")];
  let currency = document.documentElement.lang === "en" ? "USD" : "KRW",
    selected = 0;
  const complete = (code) =>
    Array.isArray(prices?.[code]?.rates) &&
    prices[code].rates.length > 0 &&
    Array.isArray(prices[code].packages) &&
    prices[code].packages.length > 0;
  const text = (ko, en) => (document.documentElement.lang === "en" ? en : ko);
  const money = (value) =>
    new Intl.NumberFormat(document.documentElement.lang === "en" ? "en-US" : "ko-KR", {
      style: "currency",
      currency,
    }).format(Number(value));
  const element = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value != null) el.textContent = value;
    return el;
  };
  function render() {
    const hasAny = complete("KRW") || complete("USD"),
      available = complete(currency);
    switcher.hidden = !hasAny;
    switcher.style.display = hasAny ? "flex" : "none";
    row.hidden = !available;
    row.style.display = available ? "grid" : "none";
    const date = new Date(prices?.asOf);
    retrieved.hidden = !available || !Number.isFinite(date.valueOf());
    if (!retrieved.hidden) {
      const stamp = new Intl.DateTimeFormat(
        document.documentElement.lang === "en" ? "en-US" : "ko-KR",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        },
      ).format(date);
      retrieved.textContent = `${text("조회 시점", "Prices retrieved")}: ${stamp}`;
    }
    currencies.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.currency === currency)),
    );
    if (!available) return;
    const data = prices[currency];
    list.replaceChildren();
    data.rates.forEach((rate) => {
      const li = element("li"),
        name = element("div", "pr-name"),
        price = element("div", "pr-price");
      const labels = {
        image: ["첫 번째 이미지 기준", "First image", "추가 이미지당", "Per additional image"],
        bodyPart: [
          "첫 번째 부위 기준",
          "First body part",
          "추가 부위당",
          "Per additional body part",
        ],
        series: ["첫 번째 시리즈 기준", "First series", "추가 시리즈당", "Per additional series"],
        study: ["첫 번째 검사 기준", "First study", "추가 검사당", "Per additional study"],
      };
      const label = labels[rate.unit];
      name.append(
        element(
          "b",
          "",
          { CT: "Computed Tomography", DX: "Digital Radiography", MR: "Magnetic Resonance" }[
            rate.modality
          ] || rate.modality,
        ),
        element("span", "", text(label[0], label[1])),
      );
      price.append(
        element("strong", "", money(rate.first)),
        element("span", "", `${text(label[2], label[3])} ${money(rate.additional)}`),
      );
      li.append(element("span", "pr-badge", rate.modality), name, price);
      list.append(li);
    });
    selected = Math.min(selected, data.packages.length - 1);
    options.replaceChildren();
    data.packages.forEach((item, index) => {
      const button = element("button", "", money(item.pay));
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(index === selected));
      button.tabIndex = index === selected ? 0 : -1;
      button.addEventListener("click", () => choose(index));
      button.addEventListener("keydown", (event) => {
        const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (delta) {
          event.preventDefault();
          choose((index + delta + data.packages.length) % data.packages.length);
        }
      });
      options.append(button);
    });
    const item = data.packages[selected];
    section.querySelector(".calc-amount").textContent = money(item.pay);
    section.querySelector(".calc-bonus").textContent =
      `+ ${money(item.bonus)} (${item.bonusPercent}%)`;
    section.querySelector(".calc-total").textContent = money(item.credit);
  }
  function choose(index) {
    selected = index;
    render();
    options.children[index]?.focus();
  }
  currencies.forEach((button) =>
    button.addEventListener("click", () => {
      currency = button.dataset.currency;
      selected = 0;
      render();
    }),
  );
  new MutationObserver(() => {
    currency = document.documentElement.lang === "en" ? "USD" : "KRW";
    selected = 0;
    render();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  render();
})();
