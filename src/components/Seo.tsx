import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
};

const DEFAULT_IMAGE = "/imagem.png";

const setMetaByName = (name: string, content: string) => {
  let element = document.head.querySelector(`meta[name=\"${name}\"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const setMetaByProperty = (property: string, content: string) => {
  let element = document.head.querySelector(`meta[property=\"${property}\"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector("link[rel=\"canonical\"]");

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const Seo = ({ title, description, path = "/", image = DEFAULT_IMAGE, noindex = false }: SeoProps) => {
  useEffect(() => {
    const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const canonicalUrl = new URL(normalizedPath, siteUrl).toString();
    const imageUrl = image.startsWith("http") ? image : new URL(image, siteUrl).toString();

    document.title = title;
    setCanonical(canonicalUrl);

    setMetaByName("description", description);
    setMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");

    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:type", "website");
    setMetaByProperty("og:url", canonicalUrl);
    setMetaByProperty("og:image", imageUrl);

    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);
    setMetaByName("twitter:image", imageUrl);
  }, [title, description, path, image, noindex]);

  return null;
};

export default Seo;