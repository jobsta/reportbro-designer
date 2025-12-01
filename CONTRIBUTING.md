# Contributing to ReportBro Designer

Thank you for your interest in contributing to **ReportBro Designer** We appreciate your help in making this project better.

ReportBro Designer is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)** for open-source projects. Please ensure your contributions comply with this license. For commercial use, a commercial license is required (see the [ReportBro website](https://www.reportbro.com/pricing/index#framework-license) for details).

---

## Contributor License Agreement (CLA)

For all non-trivial code contributions (e.g., new features, major bug fixes, or significant refactoring), we require a signed **Contributor License Agreement (CLA)**.

The CLA protects both you and the ReportBro project by ensuring that all contributions are properly licensed. You can find more information and the CLA document here:

**[https://www.reportbro.com/cla/index](https://www.reportbro.com/cla/index)**

* We will review your Pull Request and notify you if a CLA is required.
* Your contribution cannot be merged until the CLA is completed.

---

## How to Contribute

There are several ways you can contribute to ReportBro Designer:

### 1. Reporting Bugs

* **Check existing issues:** Before submitting a new bug, please check the [GitHub Issues](https://github.com/jobsta/reportbro-designer/issues) to see if the issue has already been reported.
* **Provide detailed information:** When creating a new bug report, include as much detail as possible:
    * A clear and concise **title**.
    * **Steps to reproduce** the bug.
    * The **expected behavior** and the **actual behavior**.
    * The **browser and version** you are using (e.g., Chrome 120, Firefox 121).
    * The **ReportBro Designer version** you are using.
    * Screenshots or animated image or video (if applicable).

### 2. Suggesting Enhancements and Features

* **Check existing issues:** Search the [GitHub Issues](https://github.com/jobsta/reportbro-designer/issues) to ensure your idea hasn't already been discussed.
* **Explain the need:** Please explain clearly the problem your suggestion solves. Describe the feature, why it is useful, and how you imagine it fitting into the existing application.

### 3. Writing Code and Submitting Pull Requests (PRs)

We welcome your code contributions! Please follow these steps:

#### **Setup and Development**

1.  **Fork the Repository:** Fork the `reportbro-designer` repository to your GitHub account.
2.  **Clone Locally:** Clone your forked repository to your local machine:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/reportbro-designer.git](https://github.com/YOUR_USERNAME/reportbro-designer.git)
    cd reportbro-designer
    ```
3.  **Install Dependencies:** This project uses Node.js and npm.
    ```bash
    npm install
    ```
4.  **Development Build:** To build the project for development (fast build, includes source maps for debugging):
    ```bash
    npm run build
    ```
    This generates the `reportbro.js` file in the `dist` folder, which you can use in a local development environment (like the provided demos).
5.  **Production Build (Optional):** To create the minified and transpiled version for production (ES5 compatible):
    ```bash
    npm run build-prod
    ```

#### **Creating Your Contribution**

1.  **Create a Branch:** Create a new branch for your changes based on the primary branch (`master`):
    ```bash
    git checkout -b feature/your-awesome-feature
    # or
    git checkout -b bugfix/issue-number-short-description
    ```
    The branch names are just examples.


3.  **Make your changes:** Implement your feature or fix.
    * **Coding Style:** Please adhere to the existing code style.
    * **Commit Messages:** Write clear, concise, and descriptive commit messages. If you in doubt we recommend to have a look to https://cbea.ms/git-commit/ .
4.  **Test your changes:** Ensure your changes do not introduce new bugs and that all existing features continue to work as expected.
5.  **Rebase and Squash (if necessary):** Before submitting, consider rebasing your branch on the latest upstream commit and squashing related commits into a single, meaningful commit.

#### **Submitting the PR**

1.  **Check CLA:** Ensure you have signed the CLA.
2.  **Push your branch:**
    ```bash
    git push origin your-branch-name
    ```
3.  **Open a Pull Request (PR):** Go to the original [ReportBro Designer repository on GitHub](https://github.com/jobsta/reportbro-designer) and create a Pull Request from your forked branch.
4.  **Describe the PR :** Provide a detailed description of your changes. Reference the related issue number (e.g., `Closes #123`).
5.  **Wait for Review:** We will review your code. Be prepared to discuss your changes and make
requested modifications. We try to review and come back to you as soon as possible. But sometimes it
might take a little bit.
