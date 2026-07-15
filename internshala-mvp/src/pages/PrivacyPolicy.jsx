import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-heading">
        Privacy Policy
      </h1>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
        Last Updated: July 15, 2026
      </p>

      {/* Policy Content Wrapper */}
      <div className="flex flex-col gap-12 text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-normal">
        
        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            1. Introduction
          </h2>
          <p>
            Welcome to the IncuXAI Careers Privacy Policy. This platform is owned, operated, and maintained by <strong>IncuXAI Private Limited</strong> ("Company", "we", "us", or "our").
          </p>
          <p>
            We respect your privacy and want to be clear about how we handle your personal information. This Privacy Policy describes how we collect, process, and protect your information when you access, browse, register, or use our platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            2. Aim of this Privacy Policy
          </h2>
          <p>
            The aim of this Privacy Policy is to explain in simple, clear terms how we manage your personal information. We want to help you understand what data we collect, why we collect it, how it is used, and the steps we take to keep it safe during your career search.
          </p>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            3. Scope of this Policy
          </h2>
          <p>
            This Privacy Policy applies to all visitors, applicants, and registered users of IncuXAI Careers. It governs the management of all data received through your interactions with the platform, including account setups, profile creation, search queries, and using the Resume Builder or Dashboard.
          </p>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            4. Personal Data We Collect
          </h2>
          <p>
            We only collect details that help us provide and improve our career search services. This includes:
          </p>
          <div className="flex flex-col gap-4 pl-2 mt-2">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-1">
                A. Personal Identification Data
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Your full name and profile picture (if synced automatically via Google Sign-In or provided voluntarily by you).
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-1">
                B. Contact Information
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Your email address and optional contact number.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-1">
                C. Education & Professional Information
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Your academic history, employment background, list of professional skills, resume uploads, and external portfolio links (such as LinkedIn or GitHub profiles).
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-1">
                D. Account Information
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Your user credentials (passwords), bookmarked or saved job listings, and job alert preferences.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-1">
                E. Electronic Identification Data
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Technical details automatically recorded when you visit our site, such as your IP address, browser type, operating system, and session timestamps.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider mb-1">
                F. User Generated Data
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Any text, details, and template structures you create and edit while using our Resume Builder workspace.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            5. Sources of Personal Information
          </h2>
          <p>
            We collect personal information from three primary sources:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li><strong>Directly from you</strong>: Information you type into forms, update on your profile settings page, or input when building resumes.</li>
            <li><strong>Third-Party Integrations</strong>: Profile details (like name and email address) sent to us by Google when you choose to log in using Google Sign-In.</li>
            <li><strong>Automatically collected</strong>: Technical network data and activity logs captured dynamically by our hosting servers as you browse the platform.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            6. Legal Basis for Processing Personal Data
          </h2>
          <p>
            We process your data on the following legal bases:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li><strong>Contract Execution</strong>: To deliver the core services of our platform, such as managing your candidate account and generating files in the Resume Builder.</li>
            <li><strong>Legitimate Interest</strong>: To compare your listed skills against aggregated job listings, calculating percentage match scores, and recommending relevant jobs on your dashboard.</li>
            <li><strong>Consent</strong>: When you choose to opt in to job alerts or authorize third-party authentication via Google.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            7. Consent
          </h2>
          <p>
            By creating a user profile, utilizing our Resume Builder, signing up for job alert updates, or navigating our job feeds, you consent to our collection, processing, and storage of your personal data as outlined in this policy. You can choose to withdraw your consent at any time by deleting your account.
          </p>
        </section>

        {/* Section 8 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            8. Purpose of Collecting Personal Data
          </h2>
          <p>
            We process your personal information to run and improve our services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li>To set up and manage your secure candidate account.</li>
            <li>To authenticate your identity and support federated logins via Google Sign-In.</li>
            <li>To host, format, and export documents you create inside the Resume Builder.</li>
            <li>To match your listed skills with job requirements to calculate ATS compatibility match percentages.</li>
            <li>To display personalized job suggestion feeds on your Dashboard.</li>
            <li>To process your saved listings and manage job alerts.</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            9. Disclosure of Personal Data
          </h2>
          <p>
            We do <strong>NOT</strong> sell, rent, lease, or distribute your personal information to third-party marketing companies.
          </p>
          <p>
            We may share data under strict confidentiality only with necessary service partners who assist our technical operations (such as secure database management and cloud hosting providers), or when required by legal court orders and national regulations.
          </p>
        </section>

        {/* Section 10 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            10. User Rights
          </h2>
          <p>
            We want you to have full control over your information. You hold the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li><strong>Access</strong>: View and review a summary of all the personal details stored within your account at any time.</li>
            <li><strong>Correction</strong>: Edit or update inaccurate profile details, credentials, and resume fields directly via your settings dashboard.</li>
            <li><strong>Deletion</strong>: Request the complete removal of your profile, resume files, and account logs (managed through the Account configurations page).</li>
            <li><strong>Withdrawal</strong>: Cancel consent for future data collection by deleting your account.</li>
          </ul>
        </section>

        {/* Section 11 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            11. Data Security
          </h2>
          <p>
            We use physical, administrative, and digital security measures designed to protect your candidate records against loss, misuse, or unauthorized access. However, because no method of transmission over the internet or data storage is completely secure, we cannot guarantee absolute security.
          </p>
        </section>

        {/* Section 12 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            12. Record Management
          </h2>
          <p>
            Your candidate profiles, resume content, and account settings are stored in structured, secure cloud environments. Access to these databases is strictly limited to authorized administrators carrying out necessary technical support or maintenance under confidentiality agreements.
          </p>
        </section>

        {/* Section 13 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            13. Retention of Personal Data
          </h2>
          <p>
            We keep your personal information only as long as your account is active, or as long as needed to provide you with search and Resume Builder features, resolve database disputes, and satisfy our operating compliance obligations.
          </p>
        </section>

        {/* Section 14 */}
        <section className="flex flex-col gap-3 text-slate-800 dark:text-slate-200">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            14. External Links
          </h2>
          <p className="text-sm font-medium">
            IncuXAI Careers is an AI-powered job and internship aggregation platform. When you click <strong>"Apply"</strong> on a listing, you are redirected to the employer's official website, recruitment portal, or external applicant tracking system (ATS) to complete the application process.
          </p>
          <p className="text-sm font-medium">
            Once you leave IncuXAI Careers, the privacy practices of those external sites are governed by their own respective Privacy Policies. IncuXAI Careers is not responsible for how third-party websites collect, process, or store your data after you redirect. We advise you to read their privacy policies when applying on their sites.
          </p>
        </section>

        {/* Section 15 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            15. Relationship with Terms & Conditions
          </h2>
          <p>
            This Privacy Policy forms a core part of, and should be read alongside, the IncuXAI Careers Terms & Conditions.
          </p>
        </section>

        {/* Section 16 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            16. Updates to this Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will indicate that updates have occurred by revising the last-updated date at the top of the page. Your continued use of the platform after changes are posted indicates your acceptance of the updated policy.
          </p>
        </section>

        {/* Section 17 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-850 dark:text-slate-100 font-heading">
            17. Company Details
          </h2>
          <p>
            IncuXAI Careers is owned and operated by IncuXAI Private Limited. For any questions, clarifications, or requests regarding this Privacy Policy or your personal information, please contact us at:
          </p>
          <ul className="list-none space-y-1.5 font-semibold text-xs text-slate-550 dark:text-slate-400">
            <li>📧 Email: <span className="text-brand-600 dark:text-brand-400">privacy@incuxai.com</span></li>
            <li>🏢 Address: 123 AI Innovation Tower, Tech District, Bangalore, India (Placeholder)</li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
