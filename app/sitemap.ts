// app/sitemap.ts

export default async function sitemap() {
  const baseUrl = "https://aileasebuilder.com";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/generate-lease`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/download`, lastModified: new Date() },
    { url: `${baseUrl}/payment-success`, lastModified: new Date() },

    // Legal
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date() },
    { url: `${baseUrl}/legal/disclaimer`, lastModified: new Date() },
  ];
}
