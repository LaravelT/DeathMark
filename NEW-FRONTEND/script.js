const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

navToggle?.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

navMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

const categories = [
  ['Real Estate', 'Property name, type, address, ownership, co-owner, document location.'],
  ['Demat Account', 'Depository, DP/broker name, BO ID/client ID, nominee status, registered mobile.'],
  ['Trading Account', 'Broker name, client ID, registered mobile/email, nominee status.'],
  ['Mutual Funds', 'AMC/platform, folio number, holding type, nominee status, registered mobile.'],
  ['PMS', 'PMS provider, portfolio name, relationship manager, contact number, nominee status.'],
  ['AIF', 'Fund name, category, investment manager, contact number, nominee status.'],
  ['Private Equity', 'Company/fund name, investment through, contact person, contact number, nominee status.'],
  ['Startup Investment', 'Startup name, founder/contact, investment mode, shareholding details, contact number.'],
  ['PF / PPF / EPF', 'Account type, account number, employer/bank, nominee status, registered mobile.'],
  ['Bank Account', 'Bank name, branch, account number, account type, joint holder, nominee status.'],
  ['Fixed Deposit', 'Bank/NBFC, FD number, maturity date, nominee status, branch.'],
  ['Crypto', 'Exchange/wallet name, wallet name, wallet address if required, recovery phrase location only.'],
  ['NFT', 'Marketplace, wallet name, collection name, recovery phrase location only, nominee awareness.'],
  ['Bonds / REITs / SGB', 'Investment type, issuer, certificate/folio number, nominee status, maturity date.'],
  ['Mobile Wallet', 'Wallet name, registered mobile, linked bank, nominee awareness.'],
  ['Physical Shares', 'Company name, certificate number, quantity, storage location, nominee awareness.'],
  ['Life Insurance', 'Insurance company, policy number, policy type, nominee name, agent/RM.'],
  ['Health Insurance', 'Insurance company, policy number, covered members, TPA/claim contact.'],
  ['General Insurance', 'Insurance type, company, policy number, asset covered, expiry date.'],
  ['Loan Given', 'Borrower name, amount, date given, supporting document location, repayment status.'],
  ['Movable Assets', 'Asset name, category, current location, purchase year, owner.'],
  ['Vehicles', 'Vehicle type, registration number, insurance company, RC location, primary driver.'],
  ['Bank Locker', 'Bank name, branch, locker number, key location, joint holder.'],
  ['Memberships', 'Membership name, membership number, organization, renewal date, contact person.'],
  ['Liabilities', 'Loan type, institution/lender, loan account number, EMI bank, co-borrower.'],
  ['Will Document', 'Will status, will date, executor name, original location, lawyer name.'],
  ['Trust Document', 'Trust name, trustee name, trust date, document location, lawyer name.'],
  ['Important Website / App', 'Website/app name, username/email, purpose, recovery email/mobile, recovery method location.'],
  ['Business Interests', 'Business name, ownership type, your role, partner/director contact, business address.'],
  ['Recurring Income Sources', 'Income source, organization/person, frequency, receiving bank account, contact person.'],
  ['Recurring Payments / Auto Debit', 'Payment name, type, debit bank account, frequency, auto-debit status.']
];

const categoryGrid = document.querySelector('#categoryGrid');
if (categoryGrid) {
  categoryGrid.innerHTML = categories.map((category, index) => `
    <article class="category-card reveal">
      <small>${String(index + 1).padStart(2, '0')}</small>
      <h3>${category[0]}</h3>
      <p>${category[1]} Every section includes “What should my nominee know?”</p>
    </article>
  `).join('');
}

const faqs = [
  ['What is LegacyBridge?', 'LegacyBridge is a private family wealth information vault. It helps you record where your important assets, policies, liabilities, documents and contacts exist so that your nominee is not lost when they need this information.'],
  ['Why is this required?', 'Most families do not lose assets because the assets disappear. They struggle because they do not know what exists, where it is held, which account number or folio number to quote, which person to contact, and what documents are needed. LegacyBridge creates that roadmap.'],
  ['Is this a portfolio tracker or net-worth app?', 'No. LegacyBridge does not focus on current market value, daily balance, returns or net worth. It records discovery and claim-readiness information such as account numbers, folios, policy numbers, document locations and nominee instructions.'],
  ['Why should I use this when I can create folders in Google Drive myself?', 'A Drive folder is storage. LegacyBridge is a structured system. It guides you through the exact sections your family may need, asks only useful nominee-focused fields, encrypts the information, generates a family-ready PDF, and provides a nominee claim workflow.'],
  ['Why should I pay if the data is stored in my own Google Drive?', 'You are not paying for Google Drive storage. You are paying for the structured forms, encryption layer, nominee workflow, claim access mechanism, PDF generation, reminders and the family-ready experience that a simple folder cannot provide.'],
  ['Where exactly is my vault stored?', 'Your encrypted vault is stored in the Google Drive AppData folder of the Google account with which you log in. This is not a normal visible Drive folder created for manual browsing.'],
  ['What is Google Drive AppData folder?', 'It is an app-specific private storage area in Google Drive. It is designed for application data and is not visible like normal Drive folders in the user interface. LegacyBridge uses it to reduce accidental tampering and keep the vault tied to the connected Google account.'],
  ['Does LegacyBridge store my readable financial data on its server?', 'No readable wealth records should be stored on the LegacyBridge server. Financial vault data is encrypted in the browser and saved to the user’s Google Drive. The server may store limited account, subscription, verification, claim workflow metadata and encrypted snapshots required to operate the product.'],
  ['Can LegacyBridge employees read my vault?', 'The product is designed so raw vault records are encrypted before storage. Without the correct passphrase or verified nominee decryption flow, readable vault contents should not be accessible to LegacyBridge as plain data.'],
  ['What if someone hacks or gains access to my Google Drive?', 'If they only access your Google Drive directly, the vault file should appear encrypted and unreadable. However, if they also get access to your Google account, LegacyBridge login, device and secret passphrase, risk increases. Users should protect their Google account with 2-step verification and keep their passphrase private.'],
  ['What if my Google Drive data is deleted?', 'Because the vault is stored in the user’s Google Drive AppData area, the user controls that Google account. LegacyBridge should detect missing vault files and guide restoration if backups or snapshots are available, but users should avoid revoking access or deleting app data.'],
  ['Can you stop me from deleting my own Google Drive data?', 'No. If the data is in your Google account, you ultimately control it. LegacyBridge can reduce accidental deletion by using AppData storage and backup logic, but it cannot override the owner’s Google account control.'],
  ['What happens if I forget my secret passphrase?', 'For strong privacy, the passphrase is critical. If you forget it, LegacyBridge may not be able to decrypt your normal owner vault. This is why the product should provide recovery guidance and a verified nominee snapshot flow where applicable.'],
  ['Should I save passwords, PINs or private keys?', 'No. Do not enter net banking passwords, login passwords, PINs, OTPs, private keys, seed phrases or recovery phrases. You may record where such access information is legally available or what your nominee should do next.'],
  ['Can nominee access be initiated only after death?', 'Primarily, yes, it is meant for access after the vault owner’s death. It may also be initiated in a serious medical incapacity situation where the primary owner is unable to act, subject to proof, verification and admin approval.'],
  ['How does nominee access work?', 'The nominee initiates a claim, verifies owner and nominee details, submits death or incapacity proof, and waits for admin review. Once approved, the nominee receives controlled access to the vault snapshot.'],
  ['Can a nominee access the vault anytime?', 'No. Nominee access should not be casual or automatic. It is designed to activate only through a claim workflow and after the required verification and approval.'],
  ['How is this different from government DigiLocker?', 'DigiLocker stores government-issued or verified documents. LegacyBridge is a private family roadmap for assets, accounts, policies, liabilities, lockers, contacts and instructions. It tells the family what exists and where to begin. It does not replace DigiLocker.'],
  ['Is LegacyBridge a legal will?', 'No. LegacyBridge is not a will and does not transfer ownership. It is an information and discovery vault. For estate transfer, succession and claims, the nominee/family must follow legal and institutional procedures.'],
  ['Can I add multiple bank accounts, policies and assets?', 'Yes. Each section is designed to allow multiple entries, for example multiple bank accounts, insurance policies, demat accounts, properties, FDs and liabilities.'],
  ['What happens after 48-hour setup access ends?', 'After 48 hours, the account is locked until payment. The user can activate an annual or lifetime plan to continue viewing, editing, exporting and keeping nominee access active.'],
  ['Will I get marketing calls or spam because of the data I enter?', 'LegacyBridge is designed to address this trust issue. Your readable wealth records are not stored for marketing use. We do not sell or rent your financial data. Transactional and product-related communication may still be sent as needed.']
];

const faqList = document.querySelector('#faqList');
if (faqList) {
  faqList.innerHTML = faqs.map((item, index) => `
    <button class="faq-item" type="button" aria-expanded="false">
      <span>${item[0]}</span>
      <strong>+</strong>
      <p>${item[1]}</p>
    </button>
  `).join('');
}

function bindFaqs() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach((other) => {
        other.classList.remove('active');
        other.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
bindFaqs();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
