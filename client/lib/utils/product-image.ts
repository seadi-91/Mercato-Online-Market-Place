/**
 * High-definition authentic commodity and product photography mapper for MercatoX.
 * ALWAYS respects and prioritizes the seller's original uploaded/posted image URL.
 * Only falls back to category-specific imagery if the product has no image provided.
 */
export function getAccurateProductImage(
  titleOrName?: string,
  categoryOrUnit?: string,
  passedImage?: string
): string {
  // 1. Check if passedImage is a valid image URL or path
  if (
    passedImage &&
    typeof passedImage === "string" &&
    passedImage.trim() !== "" &&
    !passedImage.includes("placeholder-product") &&
    !passedImage.includes("placeholder")
  ) {
    return passedImage.trim();
  }

  // 2. Check if categoryOrUnit was mistakenly passed an image URL
  if (
    categoryOrUnit &&
    typeof categoryOrUnit === "string" &&
    categoryOrUnit.trim() !== "" &&
    (categoryOrUnit.startsWith("http://") ||
      categoryOrUnit.startsWith("https://") ||
      categoryOrUnit.startsWith("/") ||
      categoryOrUnit.startsWith("data:") ||
      categoryOrUnit.startsWith("blob:")) &&
    !categoryOrUnit.includes("placeholder")
  ) {
    return categoryOrUnit.trim();
  }

  // 3. Check if titleOrName was passed an image URL
  if (
    titleOrName &&
    typeof titleOrName === "string" &&
    titleOrName.trim() !== "" &&
    (titleOrName.startsWith("http://") ||
      titleOrName.startsWith("https://") ||
      titleOrName.startsWith("/") ||
      titleOrName.startsWith("data:") ||
      titleOrName.startsWith("blob:")) &&
    !titleOrName.includes("placeholder")
  ) {
    return titleOrName.trim();
  }

  // 4. Fallback: If and ONLY if no image was provided by the seller, map to standard commodity photo
  const text = `${titleOrName || ""} ${categoryOrUnit || ""}`.toLowerCase();

  // Specialty Coffee & Green Arabica Beans
  if (
    text.includes("coffee") ||
    text.includes("yirgacheffe") ||
    text.includes("arabica") ||
    text.includes("sidama") ||
    text.includes("harar") ||
    text.includes("limu") ||
    text.includes("bunna") ||
    text.includes("buna") ||
    text.includes("coffee bean")
  ) {
    return "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80";
  }

  // Teff & Premium Grains (Magna, Quncho, Wheat, Barley)
  if (
    text.includes("teff") ||
    text.includes("magna") ||
    text.includes("quncho") ||
    text.includes("sergegna") ||
    text.includes("grain") ||
    text.includes("cereal") ||
    text.includes("wheat") ||
    text.includes("barley") ||
    text.includes("sinday") ||
    text.includes("flour") ||
    text.includes("duket")
  ) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";
  }

  // Sesame Seeds & Oilseeds
  if (
    text.includes("sesame") ||
    text.includes("humera") ||
    text.includes("selit") ||
    text.includes("oilseed") ||
    text.includes("seed") ||
    text.includes("niger") ||
    text.includes("nug")
  ) {
    return "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80";
  }

  // Industrial Packaging & Bags
  if (
    text.includes("sack") ||
    text.includes("bag") ||
    text.includes("woven") ||
    text.includes("packaging") ||
    text.includes("bale") ||
    text.includes("jute") ||
    text.includes("polymer") ||
    text.includes("madaberia")
  ) {
    return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80";
  }

  // Steel, Rebars & Metallurgy
  if (
    text.includes("steel") ||
    text.includes("rebar") ||
    text.includes("metal") ||
    text.includes("iron") ||
    text.includes("reinforc") ||
    text.includes("deformed") ||
    text.includes("16mm") ||
    text.includes("12mm") ||
    text.includes("brt") ||
    text.includes("biret")
  ) {
    return "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80";
  }

  // Cement & Building Materials
  if (
    text.includes("cement") ||
    text.includes("pozzolana") ||
    text.includes("ppc") ||
    text.includes("opc") ||
    text.includes("dangote") ||
    text.includes("derba") ||
    text.includes("muger") ||
    text.includes("concrete") ||
    text.includes("gypsum") ||
    text.includes("cimento")
  ) {
    return "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80";
  }

  // Solar Inverters & Energy Tech
  if (
    text.includes("solar") ||
    text.includes("inverter") ||
    text.includes("panel") ||
    text.includes("photovoltaic") ||
    text.includes("battery") ||
    text.includes("hybrid 10kw") ||
    text.includes("growatt") ||
    text.includes("deye") ||
    text.includes("generator")
  ) {
    return "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80";
  }

  // Edible Cooking Oil
  if (
    text.includes("cooking oil") ||
    text.includes("palm olein") ||
    text.includes("sunflower") ||
    text.includes("edible oil") ||
    text.includes("shemu") ||
    text.includes("jerrycan") ||
    text.includes("yegeta zeyt") ||
    (text.includes("oil") && !text.includes("oilseed")) ||
    text.includes("zeyt")
  ) {
    return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80";
  }

  // Spices & Condiments
  if (
    text.includes("cumin") ||
    text.includes("tikur azmud") ||
    text.includes("azmud") ||
    text.includes("spice") ||
    text.includes("berbere") ||
    text.includes("korarima") ||
    text.includes("ginger") ||
    text.includes("turmeric") ||
    text.includes("korerima")
  ) {
    return "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80";
  }

  // Cotton Yarn, Textiles & Apparel
  if (
    text.includes("cotton") ||
    text.includes("yarn") ||
    text.includes("textile") ||
    text.includes("fabric") ||
    text.includes("combed") ||
    text.includes("spinning") ||
    text.includes("thread") ||
    text.includes("tirat")
  ) {
    return "https://images.unsplash.com/photo-1606830733744-0ad778449672?auto=format&fit=crop&w=800&q=80";
  }

  // Leather, Hides & Tannery
  if (
    text.includes("leather") ||
    text.includes("hide") ||
    text.includes("bovine") ||
    text.includes("skin") ||
    text.includes("tannery") ||
    text.includes("wet blue") ||
    text.includes("koda")
  ) {
    return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80";
  }

  // Honey & Apiculture
  if (
    text.includes("honey") ||
    text.includes("mar") ||
    text.includes("beeswax") ||
    text.includes("organic")
  ) {
    return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80";
  }

  // Pulses & Beans
  if (
    text.includes("pulse") ||
    text.includes("pea") ||
    text.includes("chickpea") ||
    text.includes("shimbra") ||
    text.includes("bakela") ||
    text.includes("lentil") ||
    text.includes("misir") ||
    text.includes("ater")
  ) {
    return "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80";
  }

  // Electronics & Appliances
  if (
    text.includes("airfryer") ||
    text.includes("philips") ||
    text.includes("appliance") ||
    text.includes("blender") ||
    text.includes("cooker") ||
    text.includes("tv") ||
    text.includes("television") ||
    text.includes("laptop") ||
    text.includes("phone")
  ) {
    return "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80";
  }

  // Shoes & Footwear
  if (
    text.includes("shoe") ||
    text.includes("boot") ||
    text.includes("sneaker") ||
    text.includes("footwear") ||
    text.includes("chamma")
  ) {
    return "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
  }

  // Clothes & Apparel
  if (
    text.includes("cloth") ||
    text.includes("shirt") ||
    text.includes("dress") ||
    text.includes("jacket") ||
    text.includes("garment") ||
    text.includes("libs")
  ) {
    return "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";
}
