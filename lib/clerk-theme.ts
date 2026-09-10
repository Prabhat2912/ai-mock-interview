import type { Appearance } from "@clerk/types";

/**
 * Green Room appearance for every Clerk surface (SignIn, SignUp, UserButton
 * popover, and the account modal it opens). Applied once at ClerkProvider;
 * component-level `appearance` props merge over it.
 *
 * World rules honored here: square-first geometry, paper ground, ink text,
 * marquee gold reserved for the primary action and live accents, Barlow
 * Condensed display voice, tabular numerals. Element values are literal
 * tokens so the theme survives outside the Tailwind content scan.
 */
const STAGE = "#14110B";
const PAPER = "#F4EEE1";
const PAPER_DEEP = "#EAE0CB";
const PAPER_LINE = "#D6C8AC";
const MARQUEE = "#D9961F";
const MARQUEE_BRIGHT = "#F0B73E";
const MARQUEE_DEEP = "#8F5E08";
const TUNGSTEN = "#5C554A";
const SIGNAL_RED = "#A4262C";

const DISPLAY = "'Barlow Condensed', Barlow, ui-sans-serif, sans-serif";
const BODY = "Barlow, ui-sans-serif, system-ui, sans-serif";

export const clerkAppearance: Appearance = {
  layout: {
    // Hides the "Development mode" notice and its striped overlay wash so
    // local dev previews match production. Production keys never render it.
    // Prefer this flag over hiding hashed cl-internal-* classes, which
    // change on every Clerk release and silently stop working.
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorPrimary: MARQUEE,
    colorPrimaryForeground: STAGE,
    colorBackground: PAPER,
    colorText: STAGE,
    colorTextSecondary: TUNGSTEN,
    colorInputBackground: PAPER,
    colorInputForeground: STAGE,
    colorDanger: SIGNAL_RED,
    colorSuccess: "#2F6B3A",
    colorWarning: MARQUEE_DEEP,
    colorNeutral: TUNGSTEN,
    fontFamily: BODY,
    borderRadius: "0px",
  },
  elements: {
    // Cards: paper sheets, square, offset stage shadow.
    card: {
      backgroundColor: PAPER,
      border: `1px solid ${PAPER_LINE}`,
      borderRadius: "0px",
      boxShadow: "0 18px 40px -18px rgb(20 17 11 / 0.45)",
    },
    // Display voice for card headings.
    headerTitle: {
      fontFamily: DISPLAY,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      fontWeight: 600,
    },
    headerSubtitle: {
      color: TUNGSTEN,
    },
    // OAuth buttons: paper slips with ink rules.
    socialButtonsBlockButton: {
      backgroundColor: PAPER,
      border: `1px solid rgb(20 17 11 / 0.3)`,
      borderRadius: "0px",
      color: STAGE,
      "&:hover": {
        backgroundColor: PAPER_DEEP,
        borderColor: STAGE,
      },
    },
    socialButtonsBlockButtonText: {
      color: STAGE,
      fontWeight: 600,
    },
    dividerLine: {
      backgroundColor: "rgb(20 17 11 / 0.2)",
    },
    dividerText: {
      color: TUNGSTEN,
    },
    // Forms: plain labels, paper inputs, gold primary action.
    formFieldLabel: {
      color: STAGE,
      fontWeight: 700,
    },
    formFieldInput: {
      backgroundColor: PAPER,
      border: `1px solid rgb(20 17 11 / 0.3)`,
      borderRadius: "0px",
      color: STAGE,
      "&:focus": {
        borderColor: MARQUEE_DEEP,
      },
    },
    formFieldInputShowPasswordButton: {
      color: TUNGSTEN,
    },
    formFieldErrorText: {
      color: SIGNAL_RED,
    },
    formButtonPrimary: {
      backgroundColor: MARQUEE,
      color: STAGE,
      borderRadius: "0px",
      fontFamily: BODY,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      boxShadow: "0 10px 24px -12px rgb(20 17 11 / 0.55)",
      "&:hover": {
        backgroundColor: MARQUEE_BRIGHT,
      },
    },
    footerActionLink: {
      color: MARQUEE_DEEP,
      fontWeight: 700,
    },
    footerActionText: {
      color: TUNGSTEN,
    },
    footer: {
      backgroundColor: PAPER_DEEP,
      borderTop: `1px solid ${PAPER_LINE}`,
    },
    badge: {
      backgroundColor: PAPER_DEEP,
      border: `1px solid ${PAPER_LINE}`,
      borderRadius: "0px",
      color: STAGE,
    },
    // Avatars stay round: photographs are not UI chrome.
    avatarBox: {
      borderRadius: "9999px",
    },
    // UserButton popover: paper slip on the stage bar.
    userButtonPopoverCard: {
      backgroundColor: PAPER,
      border: `1px solid ${PAPER_LINE}`,
      borderRadius: "0px",
      boxShadow: "0 18px 40px -18px rgb(20 17 11 / 0.45)",
    },
    userPreviewMainIdentifier: {
      color: STAGE,
      fontWeight: 700,
    },
    userPreviewSecondaryIdentifier: {
      color: TUNGSTEN,
    },
    userButtonPopoverActionButton: {
      borderRadius: "0px",
      color: STAGE,
      "&:hover": {
        backgroundColor: PAPER_DEEP,
      },
    },
    userButtonPopoverActionButtonIcon: {
      color: STAGE,
    },
    // Account modal: dimmed stage scrim, square paper sheet.
    modalBackdrop: {
      backgroundColor: "rgb(20 17 11 / 0.72)",
    },
    modalContent: {
      borderRadius: "0px",
      boxShadow: "0 18px 40px -18px rgb(20 17 11 / 0.45)",
    },
    modalCloseButton: {
      color: TUNGSTEN,
      "&:hover": {
        color: STAGE,
      },
    },
    // Profile rail: deep paper with square cues; active cue is an ink slab.
    navbar: {
      backgroundColor: PAPER_DEEP,
      borderRight: `1px solid ${PAPER_LINE}`,
    },
    navbarButton: {
      borderRadius: "0px",
      color: TUNGSTEN,
      "&[data-active='true']": {
        backgroundColor: STAGE,
        color: PAPER,
      },
    },
    profileSectionTitleText: {
      fontFamily: DISPLAY,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      fontWeight: 600,
    },
    profileSectionPrimaryButton: {
      border: `1px solid rgb(20 17 11 / 0.3)`,
      borderRadius: "0px",
      color: STAGE,
      "&:hover": {
        backgroundColor: PAPER_DEEP,
      },
    },
    identityPreviewEditButton: {
      color: TUNGSTEN,
    },
    formFieldAction: {
      color: MARQUEE_DEEP,
    },
  },
};
