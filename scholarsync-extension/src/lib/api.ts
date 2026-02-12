// API client for ScholarSync backend

const API_URL = 'http://localhost:4000/graphql';

interface AuthTokens {
  token: string;
  refreshToken: string;
}

export class APIClient {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    const result = await chrome.storage.local.get(['token']);
    this.token = result.token || null;
  }

  async setToken(token: string) {
    this.token = token;
    await chrome.storage.local.set({ token });
  }

  async clearToken() {
    this.token = null;
    await chrome.storage.local.remove(['token', 'refreshToken']);
  }

  private async graphqlRequest(query: string, variables?: any) {
    await this.loadToken();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  // Auth
  async login(email: string, password: string): Promise<any> {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          refreshToken
          user {
            id
            email
            profileCompleted
          }
        }
      }
    `;

    const data = await this.graphqlRequest(query, { email, password });

    if (data.login.token) {
      await this.setToken(data.login.token);
      await chrome.storage.local.set({
        refreshToken: data.login.refreshToken,
        user: data.login.user
      });
    }

    return data.login;
  }

  async getProfile(): Promise<any> {
    const query = `
      query MyProfile {
        myProfile {
          id
          firstName
          lastName
          phone
          streetAddress
          city
          state
          zip
          country
          currentSchool
          major
          gpa
          academicStanding
          expectedGraduation
        }
      }
    `;

    const data = await this.graphqlRequest(query);
    return data.myProfile;
  }

  async getActivities(): Promise<any[]> {
    const query = `
      query MyActivities {
        myActivities {
          id
          type
          organization
          role
          description
          startDate
          endDate
          isCurrent
          achievements
        }
      }
    `;

    const data = await this.graphqlRequest(query);
    return data.myActivities;
  }

  async generateEssay(input: any): Promise<any> {
    const query = `
      mutation GenerateEssay($input: GenerateEssayInput!) {
        generateEssay(input: $input) {
          essay
          wordCount
        }
      }
    `;

    const data = await this.graphqlRequest(query, { input });
    return data.generateEssay;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.loadToken();
    return !!this.token;
  }
}

export const apiClient = new APIClient();
