export interface Translation {
  hero: {
    title: string;
    subtitle: string;
    hint: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    noResultsHint: string;
  };
  category: {
    all: string;
    linux: string;
    macos: string;
    windows: string;
    docker: string;
    kubernetes: string;
    git: string;
    java: string;
    python: string;
    javascript: string;
  };
  copy: {
    idle: string;
    success: string;
    tooltip: string;
  };
  danger: {
    badge: string;
    tooltip: string;
  };
  language: {
    toggle: string;
    en: string;
    ko: string;
  };
  easter: {
    cardLabel: string;
    modalTitle: string;
    github: string;
  };
  footer: {
    tagline: string;
    keyboard: string;
  };
  ad: {
    label: string;
  };
  mascot: {
    idle:  string[];
    click: string[];
  };
}
