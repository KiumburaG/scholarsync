// Form field detection and mapping

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  type: string;
  label: string;
  confidence: number;
}

export interface DetectedForm {
  fields: DetectedField[];
  isScholarshipForm: boolean;
  confidence: number;
}

export class FormDetector {
  // Common field patterns
  private fieldPatterns = {
    firstName: ['firstname', 'first_name', 'fname', 'given_name'],
    lastName: ['lastname', 'last_name', 'lname', 'surname', 'family_name'],
    email: ['email', 'e-mail', 'email_address'],
    phone: ['phone', 'telephone', 'mobile', 'phone_number', 'tel'],
    address: ['address', 'street', 'address_line', 'street_address'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    zip: ['zip', 'zipcode', 'postal', 'postal_code', 'postcode'],
    school: ['school', 'university', 'college', 'institution', 'education'],
    major: ['major', 'field_of_study', 'study', 'degree', 'program'],
    gpa: ['gpa', 'grade', 'grade_point'],
    essay: ['essay', 'statement', 'response', 'prompt', 'answer', 'describe', 'tell_us'],
  };

  // Scholarship-related keywords
  private scholarshipKeywords = [
    'scholarship',
    'essay',
    'application',
    'eligibility',
    'award',
    'financial aid',
    'grant',
    'deadline',
    'apply',
  ];

  /**
   * Detect if current page is a scholarship form
   */
  detectScholarshipPage(): boolean {
    const pageText = document.body.innerText.toLowerCase();
    const url = window.location.href.toLowerCase();

    // Check URL
    const urlMatch =
      url.includes('scholarship') ||
      url.includes('apply') ||
      url.includes('application') ||
      url.includes('essay');

    // Check page content
    let keywordMatches = 0;
    this.scholarshipKeywords.forEach(keyword => {
      if (pageText.includes(keyword)) keywordMatches++;
    });

    return urlMatch || keywordMatches >= 3;
  }

  /**
   * Detect all fillable fields on the page
   */
  detectFields(): DetectedForm {
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
    );

    const fields: DetectedField[] = [];

    inputs.forEach(element => {
      const field = this.identifyField(element);
      if (field) {
        fields.push(field);
      }
    });

    const isScholarshipForm = this.detectScholarshipPage();
    const confidence = this.calculateFormConfidence(fields, isScholarshipForm);

    return {
      fields,
      isScholarshipForm,
      confidence,
    };
  }

  /**
   * Identify field type based on attributes
   */
  private identifyField(element: HTMLElement): DetectedField | null {
    const attrs = this.getElementAttributes(element);

    let bestMatch: { type: string; confidence: number } | null = null;

    // Check each field type pattern
    for (const [fieldType, patterns] of Object.entries(this.fieldPatterns)) {
      const confidence = this.matchPatterns(attrs, patterns);
      if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { type: fieldType, confidence };
      }
    }

    if (bestMatch && bestMatch.confidence > 0.3) {
      return {
        element: element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        type: bestMatch.type,
        label: this.getFieldLabel(element),
        confidence: bestMatch.confidence,
      };
    }

    return null;
  }

  /**
   * Get element attributes for matching
   */
  private getElementAttributes(element: HTMLElement): string {
    const name = element.getAttribute('name') || '';
    const id = element.getAttribute('id') || '';
    const placeholder = element.getAttribute('placeholder') || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const className = element.className || '';

    return `${name} ${id} ${placeholder} ${ariaLabel} ${className}`.toLowerCase();
  }

  /**
   * Match attributes against patterns
   */
  private matchPatterns(attrs: string, patterns: string[]): number {
    let maxConfidence = 0;

    patterns.forEach(pattern => {
      if (attrs.includes(pattern)) {
        const confidence = 1.0 - (pattern.length / attrs.length) * 0.3;
        maxConfidence = Math.max(maxConfidence, confidence);
      }
    });

    return maxConfidence;
  }

  /**
   * Get human-readable label for field
   */
  private getFieldLabel(element: HTMLElement): string {
    // Check for <label> element
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label?.textContent) {
        return label.textContent.trim();
      }
    }

    // Check parent <label>
    const parentLabel = element.closest('label');
    if (parentLabel?.textContent) {
      return parentLabel.textContent.trim();
    }

    // Fallback to placeholder or name
    return (
      element.getAttribute('placeholder') ||
      element.getAttribute('name') ||
      element.getAttribute('id') ||
      'Unknown Field'
    );
  }

  /**
   * Calculate overall form confidence
   */
  private calculateFormConfidence(fields: DetectedField[], isScholarshipForm: boolean): number {
    if (fields.length === 0) return 0;

    const avgFieldConfidence = fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length;
    const scholarshipBonus = isScholarshipForm ? 0.3 : 0;

    return Math.min(avgFieldConfidence + scholarshipBonus, 1.0);
  }

  /**
   * Detect essay prompts
   */
  detectEssayPrompts(): Array<{ element: HTMLTextAreaElement; prompt: string }> {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');
    const prompts: Array<{ element: HTMLTextAreaElement; prompt: string }> = [];

    textareas.forEach(textarea => {
      const label = this.getFieldLabel(textarea);
      const attrs = this.getElementAttributes(textarea);

      // Check if likely an essay field
      if (
        attrs.includes('essay') ||
        attrs.includes('statement') ||
        attrs.includes('prompt') ||
        attrs.includes('describe') ||
        (textarea.getAttribute('maxlength') && parseInt(textarea.getAttribute('maxlength')!) > 500)
      ) {
        prompts.push({
          element: textarea,
          prompt: label,
        });
      }
    });

    return prompts;
  }
}

export const formDetector = new FormDetector();
