#!/usr/bin/env node

/**
 * Comprehensive Banking API Test Script
 * Tests all endpoints with various scenarios
 */
import { Command } from 'commander';
import fetch from 'node-fetch';
import chalk from 'chalk';

const program = new Command();

program
  .name('banking-api-test')
  .description('Comprehensive Banking API Test Suite')
  .version('2.0.0')
  .option('-v, --verbose', 'enable verbose output')
  .option('--very-verbose', 'enable very verbose output') // Removed -V to avoid conflict
  .option('-d, --debug', 'enable debug output with full request/response data')
  .option('-q, --quiet', 'suppress non-essential output')
  .option('-u, --url <url>', 'API base URL', 'http://localhost:3000')
  .option('-t, --timeout <ms>', 'request timeout in milliseconds', '10000')
  .option('--no-cleanup', 'skip cleanup after tests')
  .option('--parallel', 'run some tests in parallel (experimental)')
  .parse();

const options = program.opts();
const BASE_URL = options.url;
const REQUEST_TIMEOUT = parseInt(options.timeout);

const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: `test.user.${Date.now()}@example.com`,
  phoneNumber: String(Math.floor(Math.random() * 9000000000) + 1000000000).substring(0, 10),
  password: 'testpassword123'
};

let authToken = '';
let userId = '';
let accountNumber1 = '';
let accountNumber2 = '';

// Enhanced logging functions with verbosity levels
const log = {
  success: (msg) => !options.quiet && console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => !options.quiet && console.log(chalk.blue('ℹ'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => !options.quiet && console.log(chalk.cyan.bold(`\n=== ${msg} ===`)),
  verbose: (msg) => {
    if (options.verbose || options.veryVerbose || options.debug) {
      console.log(chalk.gray('🔍'), chalk.gray(msg));
    }
  },
  veryVerbose: (msg) => {
    if (options.veryVerbose || options.debug) {
      console.log(chalk.magenta('🔍🔍'), chalk.magenta(msg));
    }
  },
  debug: (obj, label = 'DEBUG') => {
    if (options.debug) {
      console.log(chalk.red(`🐛 ${label}:`));
      console.log(chalk.red(JSON.stringify(obj, null, 2)));
    }
  },
  timing: (msg, duration) => {
    if (options.verbose || options.veryVerbose || options.debug) {
      const color = duration > 1000 ? 'red' : duration > 500 ? 'yellow' : 'green';
      console.log(chalk[color](`⏱️  ${msg} (${duration}ms)`));
    }
  }
};

const makeRequest = async (method, endpoint, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    timeout: REQUEST_TIMEOUT,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Verbose logging for requests
  log.verbose(`Making ${method} request to ${BASE_URL}${endpoint}`);
  if (body && options.veryVerbose) {
    log.debug({ requestMethod: method, requestEndpoint: endpoint, requestBody: body }, 'REQUEST');
  }
  if (token && options.debug) {
    log.veryVerbose(`Using auth token: ${token.substring(0, 30)}...`);
  }

  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    log.timing(`${method} ${endpoint}`, duration);
    log.verbose(`Response received with status ${response.status}`);
    
    if (options.debug) {
      log.debug({
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseData: data
      }, 'RESPONSE');
    } else if (options.veryVerbose) {
      log.debug({ responseStatus: response.status, responseData: data }, 'RESPONSE');
    }
    
    return { status: response.status, data };
  } catch (error) {
    log.verbose(`Request failed: ${error.message}`);
    log.debug({ error: error.message, stack: error.stack }, 'ERROR');
    return { status: 500, data: { message: error.message } };
  }
};

const runTest = async (testName, testFn) => {
  try {
    log.verbose(`Starting test: ${testName}`);
    const testStartTime = Date.now();
    
    await testFn();
    
    const testDuration = Date.now() - testStartTime;
    log.success(`${testName} - PASSED`);
    log.timing(`Test completed: ${testName}`, testDuration);
    
    return { success: true, duration: testDuration };
  } catch (error) {
    log.error(`${testName} - FAILED: ${error.message}`);
    log.debug({ testName, error: error.message, stack: error.stack }, 'TEST_FAILURE');
    return { success: false, duration: 0, error: error.message };
  }
};

// Test functions (fixed all escaped characters and syntax errors)
const testUserRegistration = async () => {
  log.veryVerbose('Attempting user registration...');
  const response = await makeRequest('POST', '/auth/register', TEST_USER);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${response.data.message}`);
  }
  
  if (!response.data.user || !response.data.user.userId) {
    throw new Error('User registration should return user with userId');
  }
  
  userId = response.data.user.userId;
  log.info(`User registered with ID: ${userId}`);
  log.veryVerbose(`Registration successful for email: ${TEST_USER.email}`);
};

const testUserLogin = async () => {
  log.veryVerbose('Attempting user login...');
  const response = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  if (!response.data.token) {
    throw new Error('Login should return auth token');
  }
  
  authToken = response.data.token;
  log.info('Auth token received');
  log.veryVerbose(`Token length: ${authToken.length} characters`);
};

const testInvalidLogin = async () => {
  log.veryVerbose('Testing invalid login credentials...');
  const response = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: 'wrongpassword'
  });
  
  if (response.status !== 401) {
    throw new Error(`Expected 401 for invalid login, got ${response.status}`);
  }
  
  log.veryVerbose('Invalid login correctly rejected');
};

const testGetUserProfile = async () => {
  log.veryVerbose(`Fetching user profile for ID: ${userId}`);
  const response = await makeRequest('GET', `/users/${userId}`, null, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  if (response.data.user.email !== TEST_USER.email) {
    throw new Error('User profile should match registered user');
  }
  
  log.veryVerbose('User profile data validated successfully');
};

const testUpdateUserProfile = async () => {
  const updateData = {
    firstName: 'Updated',
    lastName: 'Name',
    phoneNumber: String(Math.floor(Math.random() * 9000000000) + 1000000000).substring(0, 10)
  };
  
  log.veryVerbose(`Updating user profile with: ${JSON.stringify(updateData)}`);
  const response = await makeRequest('PUT', `/users/${userId}`, updateData, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  log.veryVerbose('User profile updated successfully');
};

const testCreateSavingsAccount = async () => {
  log.veryVerbose('Creating SAVINGS account...');
  const response = await makeRequest('POST', '/accounts', {
    accountType: 'SAVINGS',
    balance: 1000.00
  }, authToken);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${response.data.message}`);
  }
  
  if (!response.data.account || !response.data.account.accountNumber) {
    throw new Error('Account creation should return account with accountNumber');
  }
  
  accountNumber1 = response.data.account.accountNumber;
  log.info(`Savings account created: ${accountNumber1}`);
  log.veryVerbose(`Account balance set to: $${response.data.account.balance}`);
};

const testCreateCurrentAccount = async () => {
  log.veryVerbose('Creating CURRENT account...');
  const response = await makeRequest('POST', '/accounts', {
    accountType: 'CURRENT',
    balance: 500.00
  }, authToken);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${response.data.message}`);
  }
  
  accountNumber2 = response.data.account.accountNumber;
  log.info(`Current account created: ${accountNumber2}`);
  log.veryVerbose(`Account balance set to: $${response.data.account.balance}`);
};

const testInvalidAccountType = async () => {
  log.veryVerbose('Testing invalid account type...');
  const response = await makeRequest('POST', '/accounts', {
    accountType: 'CHECKING',
    balance: 100.00
  }, authToken);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for invalid account type, got ${response.status}`);
  }
  
  log.veryVerbose('Invalid account type correctly rejected');
};

const testGetAccountDetails = async () => {
  log.veryVerbose(`Fetching details for account: ${accountNumber1}`);
  const response = await makeRequest('GET', `/accounts/${accountNumber1}`, null, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  if (response.data.accountNumber !== accountNumber1) {
    throw new Error('Account details should match requested account');
  }
  
  log.veryVerbose(`Account details retrieved: Type=${response.data.accountType}, Balance=$${response.data.balance}`);
};

const testUpdateAccount = async () => {
  log.veryVerbose(`Updating account: ${accountNumber1}`);
  const response = await makeRequest('PATCH', `/accounts/${accountNumber1}`, {
    status: 'ACTIVE'
  }, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  log.veryVerbose('Account update successful');
};

const testDepositMoney = async () => {
  const depositAmount = 500.00;
  log.veryVerbose(`Depositing $${depositAmount} to account: ${accountNumber1}`);
  
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/deposit`, {
    amount: depositAmount,
    description: 'Test deposit'
  }, authToken);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${response.data.message}`);
  }
  
  log.info('Deposit successful');
  log.veryVerbose(`New balance: $${response.data.newBalance || 'N/A'}`);
};

const testInvalidDeposit = async () => {
  log.veryVerbose('Testing negative deposit amount...');
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/deposit`, {
    amount: -100.00,
    description: 'Invalid deposit'
  }, authToken);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for negative deposit, got ${response.status}`);
  }
  
  log.veryVerbose('Negative deposit correctly rejected');
};

const testWithdrawMoney = async () => {
  const withdrawAmount = 200.00;
  log.veryVerbose(`Withdrawing $${withdrawAmount} from account: ${accountNumber1}`);
  
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/withdraw`, {
    amount: withdrawAmount,
    description: 'Test withdrawal'
  }, authToken);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${response.data.message}`);
  }
  
  log.info('Withdrawal successful');
  log.veryVerbose(`New balance: $${response.data.newBalance || 'N/A'}`);
};

const testInsufficientFunds = async () => {
  log.veryVerbose('Testing insufficient funds scenario...');
  const response = await makeRequest('POST', `/accounts/${accountNumber2}/transactions/withdraw`, {
    amount: 10000.00,
    description: 'Large withdrawal'
  }, authToken);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for insufficient funds, got ${response.status}`);
  }
  
  log.veryVerbose('Insufficient funds correctly prevented');
};

const testTransferMoney = async () => {
  const transferAmount = 300.00;
  log.veryVerbose(`Transferring $${transferAmount} from ${accountNumber1} to ${accountNumber2}`);
  
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/transfer`, {
    toAccountNumber: accountNumber2,
    amount: transferAmount,
    description: 'Test transfer'
  }, authToken);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}: ${response.data.message}`);
  }
  
  log.info(`Transfer successful: ${accountNumber1} → ${accountNumber2}`);
  log.veryVerbose('Transfer completed successfully');
};

const testSelfTransfer = async () => {
  log.veryVerbose('Testing self-transfer (should fail)...');
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/transfer`, {
    toAccountNumber: accountNumber1,
    amount: 100.00,
    description: 'Self transfer'
  }, authToken);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for self transfer, got ${response.status}`);
  }
  
  log.veryVerbose('Self-transfer correctly prevented');
};

const testTransferToNonexistentAccount = async () => {
  log.veryVerbose('Testing transfer to nonexistent account...');
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/transfer`, {
    toAccountNumber: '9999999999',
    amount: 100.00,
    description: 'Transfer to nowhere'
  }, authToken);
  
  if (response.status !== 404) {
    throw new Error(`Expected 404 for nonexistent account, got ${response.status}`);
  }
  
  log.veryVerbose('Transfer to nonexistent account correctly rejected');
};

const testGetTransactionHistory = async () => {
  log.veryVerbose(`Fetching transaction history for account: ${accountNumber1}`);
  const response = await makeRequest('GET', `/accounts/${accountNumber1}/transactions`, null, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  if (!Array.isArray(response.data.transactions)) {
    throw new Error('Transaction history should return array of transactions');
  }
  
  log.info(`Found ${response.data.transactions.length} transactions`);
  log.veryVerbose(`Transaction types: ${response.data.transactions.map(t => t.type).join(', ')}`);
};

const testListUserAccounts = async () => {
  log.veryVerbose(`Listing all accounts for user: ${userId}`);
  const response = await makeRequest('GET', `/users/${userId}/accounts`, null, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  if (!Array.isArray(response.data.accounts)) {
    throw new Error('User accounts should return array');
  }
  
  log.info(`User has ${response.data.accounts.length} accounts`);
  log.veryVerbose(`Account numbers: ${response.data.accounts.map(a => a.accountNumber).join(', ')}`);
};

const testUnauthorizedAccess = async () => {
  log.veryVerbose('Testing unauthorized access with invalid token...');
  const response = await makeRequest('GET', `/accounts/${accountNumber1}`, null, 'invalid-token');
  
  if (response.status !== 401) {
    throw new Error(`Expected 401 for invalid token, got ${response.status}`);
  }
  
  log.veryVerbose('Unauthorized access correctly blocked');
};

const testAccessOtherUserAccount = async () => {
  log.veryVerbose('Testing cross-user account access...');
  
  // Create another user first
  const otherUser = {
    firstName: 'Other',
    lastName: 'User',
    email: `other.user.${Date.now()}@example.com`,
    phoneNumber: String(Math.floor(Math.random() * 9000000000) + 1000000000).substring(0, 10),
    password: 'password123'
  };
  
  await makeRequest('POST', '/auth/register', otherUser);
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: otherUser.email,
    password: otherUser.password
  });
  
  const otherToken = loginResponse.data.token;
  
  // Try to access first user's account with second user's token
  const response = await makeRequest('GET', `/accounts/${accountNumber1}`, null, otherToken);
  
  if (response.status !== 403 && response.status !== 404) {
    throw new Error(`Expected 403 or 404 when accessing other user's account, got ${response.status}`);
  }
  
  log.veryVerbose('Cross-user access correctly prevented');
};

const testGetBalance = async () => {
  log.veryVerbose(`Checking balance for account: ${accountNumber1}`);
  const response = await makeRequest('GET', `/accounts/${accountNumber1}/balance`, null, authToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${response.data.message}`);
  }
  
  if (typeof response.data.balance === 'undefined') {
    throw new Error('Balance endpoint should return balance');
  }
  
  log.info(`Account balance: $${response.data.balance}`);
};

const testMissingFields = async () => {
  log.veryVerbose('Testing account creation with missing fields...');
  const response = await makeRequest('POST', '/accounts', {
    balance: 100.00
    // Missing accountType
  }, authToken);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for missing accountType, got ${response.status}`);
  }
  
  log.veryVerbose('Missing required fields correctly validated');
};

const testZeroAmount = async () => {
  log.veryVerbose('Testing zero amount transaction...');
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/deposit`, {
    amount: 0,
    description: 'Zero deposit'
  }, authToken);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for zero amount, got ${response.status}`);
  }
  
  log.veryVerbose('Zero amount correctly rejected');
};

// Additional test functions...
const testDeleteUser = async () => {
  log.veryVerbose('Testing user deletion...');
  
  const deleteTestUser = {
    firstName: 'Delete',
    lastName: 'Test',
    email: `delete.test.${Date.now()}@example.com`,
    phoneNumber: String(Math.floor(Math.random() * 9000000000) + 1000000000).substring(0, 10),
    password: 'deletetest123'
  };
  
  const registerResponse = await makeRequest('POST', '/auth/register', deleteTestUser);
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: deleteTestUser.email,
    password: deleteTestUser.password
  });
  
  const deleteUserId = registerResponse.data.user.userId;
  const deleteToken = loginResponse.data.token;
  
  const response = await makeRequest('DELETE', `/users/${deleteUserId}`, null, deleteToken);
  
  if (response.status !== 200) {
    throw new Error(`Expected 200 for user deletion, got ${response.status}: ${response.data.message}`);
  }
  
  log.info('User deletion successful');
  log.veryVerbose('User and associated data deleted');
};

const testCreateMultipleAccountsSameType = async () => {
  log.veryVerbose('Testing multiple accounts of same type...');
  
  const response1 = await makeRequest('POST', '/accounts', {
    accountType: 'SAVINGS',
    balance: 2000.00
  }, authToken);
  
  const response2 = await makeRequest('POST', '/accounts', {
    accountType: 'SAVINGS',
    balance: 3000.00
  }, authToken);
  
  if (response1.status !== 201 || response2.status !== 201) {
    throw new Error('Should allow multiple accounts of same type');
  }
  
  log.info('Multiple SAVINGS accounts created successfully');
  log.veryVerbose(`Account 1: ${response1.data.account.accountNumber}, Account 2: ${response2.data.account.accountNumber}`);
};

const testLargeAmountTransaction = async () => {
  log.veryVerbose('Testing large amount transaction...');
  const response = await makeRequest('POST', `/accounts/${accountNumber1}/transactions/deposit`, {
    amount: 999999.99,
    description: 'Large amount deposit'
  }, authToken);
  
  if (response.status !== 201) {
    throw new Error(`Expected 201 for large deposit, got ${response.status}: ${response.data.message}`);
  }
  
  log.info('Large amount transaction successful');
  log.veryVerbose('Large deposit processed successfully');
};

const testConcurrentRequests = async () => {
  log.veryVerbose('Testing concurrent requests...');
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      makeRequest('POST', `/accounts/${accountNumber1}/transactions/deposit`, {
        amount: 10.00,
        description: `Concurrent deposit ${i + 1}`
      }, authToken)
    );
  }
  
  const results = await Promise.all(promises);
  const allSuccessful = results.every(result => result.status === 201);
  
  if (!allSuccessful) {
    throw new Error('Not all concurrent requests succeeded');
  }
  
  log.info('Concurrent requests test passed');
  log.veryVerbose(`Successfully processed ${results.length} concurrent deposits`);
};

// Main test runner with enhanced reporting
const runAllTests = async () => {
  if (!options.quiet) {
    console.log(chalk.cyan.bold('🏦 Banking API Comprehensive Test Suite v2.0\n'));
    console.log(chalk.yellow.bold(`📍 Testing against: ${BASE_URL}`));
    console.log(chalk.yellow.bold(`📧 Test User Email: ${TEST_USER.email}`));
    console.log(chalk.yellow.bold(`📱 Test User Phone: ${TEST_USER.phoneNumber}`));
    console.log(chalk.yellow.bold(`⏱️  Request Timeout: ${REQUEST_TIMEOUT}ms`));
    
    if (options.verbose) console.log(chalk.gray('🔍 Verbose mode: ON'));
    if (options.veryVerbose) console.log(chalk.magenta('🔍🔍 Very Verbose mode: ON'));
    if (options.debug) console.log(chalk.red('🐛 Debug mode: ON'));
    if (options.parallel) console.log(chalk.blue('⚡ Parallel mode: ON'));
    
    console.log('');
  }
  
  const tests = [
    // Authentication Tests
    { name: 'User Registration', fn: testUserRegistration, category: 'Authentication' },
    { name: 'User Login', fn: testUserLogin, category: 'Authentication' },
    { name: 'Invalid Login', fn: testInvalidLogin, category: 'Authentication' },
    
    // User Management Tests
    { name: 'Get User Profile', fn: testGetUserProfile, category: 'User Management' },
    { name: 'Update User Profile', fn: testUpdateUserProfile, category: 'User Management' },
    
    // Account Management Tests
    { name: 'Create Savings Account', fn: testCreateSavingsAccount, category: 'Account Management' },
    { name: 'Create Current Account', fn: testCreateCurrentAccount, category: 'Account Management' },
    { name: 'Create Multiple Same Type Accounts', fn: testCreateMultipleAccountsSameType, category: 'Account Management' },
    { name: 'Invalid Account Type', fn: testInvalidAccountType, category: 'Account Management' },
    { name: 'Missing Required Fields', fn: testMissingFields, category: 'Account Management' },
    { name: 'Get Account Details', fn: testGetAccountDetails, category: 'Account Management' },
    { name: 'Update Account', fn: testUpdateAccount, category: 'Account Management' },
    { name: 'Get Account Balance', fn: testGetBalance, category: 'Account Management' },
    { name: 'List User Accounts', fn: testListUserAccounts, category: 'Account Management' },
    
    // Transaction Tests
    { name: 'Deposit Money', fn: testDepositMoney, category: 'Transactions' },
    { name: 'Large Amount Deposit', fn: testLargeAmountTransaction, category: 'Transactions' },
    { name: 'Invalid Deposit (Negative)', fn: testInvalidDeposit, category: 'Transactions' },
    { name: 'Invalid Deposit (Zero)', fn: testZeroAmount, category: 'Transactions' },
    { name: 'Withdraw Money', fn: testWithdrawMoney, category: 'Transactions' },
    { name: 'Insufficient Funds', fn: testInsufficientFunds, category: 'Transactions' },
    { name: 'Transfer Money', fn: testTransferMoney, category: 'Transactions' },
    { name: 'Self Transfer (Should Fail)', fn: testSelfTransfer, category: 'Transactions' },
    { name: 'Transfer to Nonexistent Account', fn: testTransferToNonexistentAccount, category: 'Transactions' },
    { name: 'Get Transaction History', fn: testGetTransactionHistory, category: 'Transactions' },
    
    // Advanced Tests
    { name: 'Concurrent Requests', fn: testConcurrentRequests, category: 'Performance' },
    
    // Security Tests
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess, category: 'Security' },
    { name: 'Access Other User Account', fn: testAccessOtherUserAccount, category: 'Security' },
    
    // Cleanup Tests
    { name: 'Delete User', fn: testDeleteUser, category: 'Cleanup' },
  ];
  
  let passed = 0;
  let failed = 0;
  let testResults = [];
  const startTime = Date.now();
  
  log.verbose(`Starting test suite with ${tests.length} tests...`);
  
  for (const test of tests) {
    log.section(test.name);
    const result = await runTest(test.name, test.fn);
    
    testResults.push({
      name: test.name,
      category: test.category,
      success: result.success,
      duration: result.duration,
      error: result.error
    });
    
    if (result.success) {
      passed++;
      if (!options.quiet) log.info(`✓ Completed in ${result.duration}ms`);
    } else {
      failed++;
      if (!options.quiet) log.error(`✗ Failed after ${result.duration}ms`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Enhanced results reporting
  if (!options.quiet) {
    console.log(chalk.cyan.bold('\n=== TEST RESULTS ==='));
    log.success(`Passed: ${passed}`);
    if (failed > 0) {
      log.error(`Failed: ${failed}`);
    } else {
      log.success(`Failed: ${failed}`);
    }
    
    const total = passed + failed;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(chalk.cyan.bold(`\nOverall: ${passed}/${total} tests passed (${percentage}%)`));
    console.log(chalk.cyan.bold(`Total execution time: ${totalDuration}ms`));
    console.log(chalk.cyan.bold(`Average test time: ${(totalDuration / total).toFixed(1)}ms`));
    
    // Category breakdown
    if (options.verbose) {
      console.log(chalk.gray('\n--- Category Breakdown ---'));
      const categories = {};
      testResults.forEach(result => {
        if (!categories[result.category]) {
          categories[result.category] = { passed: 0, failed: 0, total: 0 };
        }
        categories[result.category].total++;
        if (result.success) {
          categories[result.category].passed++;
        } else {
          categories[result.category].failed++;
        }
      });
      
      Object.entries(categories).forEach(([category, stats]) => {
        const categoryPercentage = ((stats.passed / stats.total) * 100).toFixed(1);
        console.log(chalk.gray(`${category}: ${stats.passed}/${stats.total} (${categoryPercentage}%)`));
      });
    }
    
    if (failed === 0) {
      console.log(chalk.green.bold('\n🎉 All tests passed! Your API is working perfectly!'));
      if (!options.quiet) {
        log.info('\nTest Coverage Summary:');
        log.info('- User authentication and authorization ✓');
        log.info('- Account management operations ✓');
        log.info('- Transaction processing ✓');
        log.info('- Security and validation ✓');
        log.info('- Error handling ✓');
        log.info('- Edge cases and concurrency ✓');
        log.info('- Data integrity ✓');
      }
    } else {
      console.log(chalk.yellow.bold('\n⚠️  Some tests failed. Check the errors above.'));
      log.warning('Review failed tests and fix the corresponding API endpoints.');
      
      if (options.verbose) {
        console.log(chalk.red('\n--- Failed Tests ---'));
        testResults.filter(r => !r.success).forEach(result => {
          console.log(chalk.red(`❌ ${result.name}: ${result.error}`));
        });
      }
    }
    
    // Test environment info
    console.log(chalk.gray('\n--- Test Environment ---'));
    console.log(chalk.gray(`Node.js: ${process.version}`));
    console.log(chalk.gray(`Platform: ${process.platform}`));
    console.log(chalk.gray(`Architecture: ${process.arch}`));
    console.log(chalk.gray(`Base URL: ${BASE_URL}`));
    console.log(chalk.gray(`Test Suite Version: 2.0.0`));
  }
  
  return { passed, failed, totalDuration, testResults };
};

// Enhanced cleanup function
const cleanup = async () => {
  if (!options.cleanup) {
    log.info('🚫 Cleanup skipped due to --no-cleanup flag');
    return;
  }
  
  if (userId && authToken) {
    try {
      log.info('\n🧹 Cleaning up test data...');
      log.verbose('Attempting to delete test user and associated accounts...');
      
      const response = await makeRequest('DELETE', `/users/${userId}`, null, authToken);
      
      if (response.status === 200) {
        log.success('✓ Test user and associated accounts deleted');
        log.verbose('Cleanup completed successfully');
      } else {
        log.warning('⚠ Cleanup partially successful');
        log.debug({ cleanupResponse: response }, 'CLEANUP');
      }
    } catch (error) {
      log.warning('⚠ Cleanup failed - manual cleanup may be required');
      log.debug({ cleanupError: error.message }, 'CLEANUP_ERROR');
    }
  }
};

// Enhanced error handling
process.on('SIGINT', async () => {
  console.log('\n');
  log.warning('🛑 Test interrupted by user');
  await cleanup();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log.error(`💥 Uncaught Exception: ${error.message}`);
  log.debug({ error: error.message, stack: error.stack }, 'UNCAUGHT_EXCEPTION');
  cleanup().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  log.error(`💥 Unhandled Rejection: ${reason}`);
  log.debug({ reason }, 'UNHANDLED_REJECTION');
  cleanup().then(() => process.exit(1));
});

// Main execution
if (import.meta.url.endsWith(process.argv[1]) || 
    process.argv[1].endsWith('comprehensive-api-test.js') || 
    process.argv[1].endsWith('test-api.js')) {
  
  runAllTests()
    .then(async (results) => {
      await cleanup();
      if (results.failed > 0) {
        process.exit(1); // Exit with error code if tests failed
      }
    })
    .catch(async (error) => {
      log.error(`💥 Fatal error: ${error.message}`);
      log.debug({ error: error.message, stack: error.stack }, 'FATAL_ERROR');
      await cleanup();
      process.exit(1);
    });
}

export { runAllTests, cleanup };
