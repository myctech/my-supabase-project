'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';

interface FormData {
  campaignBudget: string;
  campaignDuration: string;
  location: string;
  sportsPreference: string;
  intendedImpressions: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    campaignBudget: '',
    campaignDuration: '',
    location: '',
    sportsPreference: '',
    intendedImpressions: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<FormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateFields = (): Partial<FormData> => {
    const errors: Partial<FormData> = {};

    // 1) Campaign Budget: whole number only (no decimals)
    if (!/^\d+$/.test(formData.campaignBudget)) {
      errors.campaignBudget = 'Please enter a whole number (no decimals) for the campaign budget.';
    }

    // 2) Campaign Duration: whole number (weeks)
    if (!/^\d+$/.test(formData.campaignDuration)) {
      errors.campaignDuration = 'Please enter a whole number (no decimals) for the campaign duration (in weeks).';
    }

    // 3) Location: exactly 3 alphanumeric characters
    if (!/^[A-Za-z0-9]{3}$/.test(formData.location)) {
      errors.location = 'Please enter the first three alphanumeric characters of your UK postcode (e.g., SW1).';
    }

    // 4) Sports Preference: must choose Cricket, Football, or Golf
    if (!formData.sportsPreference) {
      errors.sportsPreference = 'Please select a sports preference.';
    }

    // 5) Intended Impressions: whole number (e.g. 10000)
    if (!/^\d+$/.test(formData.intendedImpressions)) {
      errors.intendedImpressions = 'Please enter a valid integer (e.g. 10000) for intended impressions.';
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setServerError(data.error || 'Something went wrong.');
      } else {
        // Store recommendations in sessionStorage
        sessionStorage.setItem('recommendationResults', JSON.stringify(data.products));
        // Redirect to the results page
        router.push('/results');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setServerError('An unexpected error occurred while fetching recommendations.');
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER with Logo & Steps */}
      <header className={styles.header}>
        <div className={styles.logo}>
        <Image src="/your-logo.png" alt="Your Logo" width={100} height={50} />
        </div>
        <div className={styles.steps}>
          <div className={`${styles.step} ${styles.active}`}>Deal</div>
          <div className={styles.step}>Buyer Info</div>
          <div className={styles.step}>Your Info</div>
          <div className={styles.step}>Line Items</div>
          <div className={styles.step}>Signature & Payment</div>
          <div className={styles.step}>Review</div>
        </div>
      </header>

      {/* MAIN Content */}
      <main className={styles.main}>
        <div className={styles.formContainer}>
          <h1>Campaign Recommendation Form</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Campaign Budget (no decimals):</label>
              <input
                type="number"
                step="1"
                name="campaignBudget"
                value={formData.campaignBudget}
                onChange={handleChange}
                required
              />
              {fieldErrors.campaignBudget && (
                <p className={styles.errorText}>{fieldErrors.campaignBudget}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Campaign Duration (weeks):</label>
              <input
                type="number"
                step="1"
                name="campaignDuration"
                value={formData.campaignDuration}
                onChange={handleChange}
                required
              />
              {fieldErrors.campaignDuration && (
                <p className={styles.errorText}>{fieldErrors.campaignDuration}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Location (first 3 characters of UK postcode):</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              {fieldErrors.location && (
                <p className={styles.errorText}>{fieldErrors.location}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Sports Preference:</label>
              <select
                name="sportsPreference"
                value={formData.sportsPreference}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a sport --</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Golf">Golf</option>
              </select>
              {fieldErrors.sportsPreference && (
                <p className={styles.errorText}>{fieldErrors.sportsPreference}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Intended Impressions (e.g. 10000):</label>
              <input
                type="number"
                step="1"
                name="intendedImpressions"
                value={formData.intendedImpressions}
                onChange={handleChange}
                required
              />
              {fieldErrors.intendedImpressions && (
                <p className={styles.errorText}>{fieldErrors.intendedImpressions}</p>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              Get Recommendations
            </button>
          </form>

          {serverError && <p className={styles.errorText}>{serverError}</p>}
        </div>
      </main>

      {/* FOOTER SECTION */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerCol}>
            <h3>Info</h3>
            <ul>
              <li><a href="#">Formats</a></li>
              <li><a href="#">Compression</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Status</a></li>
              <li><a href="#">Policy</a></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h3>Getting Started</h3>
            <ul>
              <li><a href="#">Introduction</a></li>
              <li><a href="#">Themes</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Usages</a></li>
              <li><a href="#">Elements</a></li>
              <li><a href="#">Global</a></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h3>Resources</h3>
            <ul>
              <li><a href="#">API</a></li>
              <li><a href="#">Form Validation</a></li>
              <li><a href="#">Accessibility</a></li>
              <li><a href="#">Marketplace</a></li>
              <li><a href="#">Visibility</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>

          <div className={`${styles.footerCol} ${styles.newsletter}`}>
            <h3>Newsletter</h3>
            <p>
              Subscribe to our newsletter for a weekly dose of news, updates,
              helpful tips, and exclusive offers.
            </p>
            <input type="email" placeholder="Your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
