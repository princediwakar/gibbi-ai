import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if we need to login
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('button[aria-label="User menu"]') !== null;
    });
    
    if (!isLoggedIn) {
      console.log('Not logged in, skipping test');
      return;
    }
    
    // Find and click on a quiz
    console.log('Finding a quiz to take...');
    await page.waitForSelector('a[href*="/quiz/"]');
    await page.click('a[href*="/quiz/"]');
    await page.waitForLoadState('networkidle');
    
    // Start the quiz
    console.log('Starting the quiz...');
    await page.waitForSelector('button:has-text("Start Quiz")');
    await page.click('button:has-text("Start Quiz")');
    
    // Answer all questions
    console.log('Answering questions...');
    let questionCount = 0;
    
    while (true) {
      try {
        // Wait for a question to appear
        await page.waitForSelector('button[class*="quiz-option"]', { timeout: 5000 });
        
        // Click on the first option
        await page.click('button[class*="quiz-option"]');
        questionCount++;
        
        // Check if we've reached the completion screen
        const completionVisible = await page.evaluate(() => {
          return document.querySelector('h1:has-text("Congratulations")') !== null;
        });
        
        if (completionVisible) {
          console.log(`Quiz completed! Answered ${questionCount} questions.`);
          break;
        }
      } catch (e) {
        // If we can't find any more questions, we might be at the results page
        console.log('No more questions found, checking if quiz is complete...');
        
        const completionVisible = await page.evaluate(() => {
          return document.querySelector('h1:has-text("Congratulations")') !== null;
        });
        
        if (completionVisible) {
          console.log(`Quiz completed! Answered ${questionCount} questions.`);
          break;
        } else {
          console.error('Error during quiz:', e);
          break;
        }
      }
    }
    
    // Check for the View Detailed Results button
    console.log('Checking for View Detailed Results button...');
    await page.waitForSelector('button:has-text("View Detailed Results")');
    
    // Click on View Detailed Results
    console.log('Clicking View Detailed Results...');
    await page.click('button:has-text("View Detailed Results")');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the results page
    const isResultsPage = await page.evaluate(() => {
      return document.querySelector('h3:has-text("Performance Breakdown")') !== null;
    });
    
    if (isResultsPage) {
      console.log('Successfully navigated to results page!');
    } else {
      console.log('Failed to navigate to results page.');
    }
    
    // Wait a bit to see the results
    await new Promise(r => setTimeout(r, 5000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})(); 