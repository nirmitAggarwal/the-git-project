/**
 * Branding & organizer metadata for the official course completion certificate.
 * Keep all human-facing names and links here so the on-screen card and the
 * downloadable PDF stay in sync.
 */
export const CERTIFICATE_CONFIG = {
  organization: 'Microsoft Student Chapter - MSIT',
  organizationTagline: 'MSC-MSIT | Empowering student developers',
  organizationLinkedIn: 'https://www.linkedin.com/company/mscmsit/',

  courseName: 'Git & GitHub Course',
  certificateTitle: 'Certificate of Completion',
  certificateSubtitle:
    'Distributed Version Control & Collaborative Development with Git and GitHub',
  descriptionLine1:
    'has successfully completed the Git & GitHub Course offered by Microsoft Student Chapter - MSIT,',
  descriptionLine2:
    'demonstrating proficiency in version control, branching, merging, pull requests and collaborative GitHub workflows.',

  authorName: 'Nirmit Aggarwal',
  authorRole: 'Course Creator & Instructor',
  authorLinkedIn: 'https://www.linkedin.com/in/nirmit-aggarwal/',
  authorGitHub: 'https://github.com/nirmitAggarwal',
  authorWebsite: 'https://www.theboringedit.in/',
} as const;

export type CertificateConfig = typeof CERTIFICATE_CONFIG;
