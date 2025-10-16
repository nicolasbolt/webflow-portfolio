/**
 * Lighthouse Widget - Vanilla JavaScript
 * Simple website performance analyzer that can be dropped into any static site
 */
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiEndpoint: '/api/lighthouse', // Cloudflare Pages Function endpoint
    containerSelector: '[data-lighthouse-widget]'
  };

  // Score descriptions and improvement suggestions
  const scoreDescriptions = {
    performance: {
      title: 'Performance',
      description: 'How fast your page loads and becomes interactive'
    },
    accessibility: {
      title: 'Accessibility', 
      description: 'How accessible your page is to users with disabilities'
    },
    bestPractices: {
      title: 'Best Practices',
      description: 'Whether your page follows web development best practices'
    },
    seo: {
      title: 'SEO',
      description: 'How well your page is optimized for search engines'
    }
  };

  const improvementSuggestions = {
    performance: [
      { title: 'Optimize Images', description: 'Serve images in next-gen formats (WebP, AVIF) and properly size them', impact: 'High' },
      { title: 'Minify JavaScript and CSS', description: 'Remove unnecessary characters and whitespace from code files', impact: 'Medium' },
      { title: 'Enable Text Compression', description: 'Use gzip or brotli compression to reduce file transfer sizes', impact: 'High' },
      { title: 'Eliminate Render-Blocking Resources', description: 'Load critical CSS inline and defer non-critical JavaScript', impact: 'High' },
      { title: 'Use a Content Delivery Network (CDN)', description: 'Serve static assets from servers closer to your users', impact: 'Medium' },
      { title: 'Preload Key Requests', description: 'Use rel="preload" for critical resources needed early in page load', impact: 'Medium' }
    ],
    accessibility: [
      { title: 'Add Alt Text to Images', description: 'Provide descriptive alternative text for all informative images', impact: 'High' },
      { title: 'Ensure Proper Color Contrast', description: 'Use sufficient color contrast ratios (4.5:1 for normal text)', impact: 'High' },
      { title: 'Add Form Labels', description: 'Associate labels with form controls using for/id attributes', impact: 'High' },
      { title: 'Use Semantic HTML', description: 'Use proper heading hierarchy (h1-h6) and semantic elements', impact: 'Medium' },
      { title: 'Make Content Keyboard Accessible', description: 'Ensure all interactive elements can be accessed via keyboard', impact: 'High' },
      { title: 'Add Focus Indicators', description: 'Provide visible focus indicators for keyboard navigation', impact: 'Medium' }
    ],
    bestPractices: [
      { title: 'Use HTTPS', description: 'Serve your website over a secure HTTPS connection', impact: 'High' },
      { title: 'Avoid Deprecated APIs', description: 'Replace deprecated JavaScript APIs with modern alternatives', impact: 'Medium' },
      { title: 'Handle JavaScript Errors', description: 'Implement proper error handling and avoid console errors', impact: 'Medium' },
      { title: 'Use HTTP/2', description: 'Upgrade to HTTP/2 for better performance and security', impact: 'Medium' },
      { title: 'Implement CSP Headers', description: 'Add Content Security Policy headers to prevent XSS attacks', impact: 'High' },
      { title: 'Optimize Third-Party Code', description: 'Minimize and optimize external scripts and resources', impact: 'Medium' }
    ],
    seo: [
      { title: 'Add Meta Description', description: 'Write compelling meta descriptions for better search results', impact: 'High' },
      { title: 'Use Descriptive Title Tags', description: 'Create unique, descriptive titles for each page (50-60 characters)', impact: 'High' },
      { title: 'Implement Structured Data', description: 'Add schema markup to help search engines understand content', impact: 'Medium' },
      { title: 'Optimize for Mobile', description: 'Ensure your site is mobile-friendly and responsive', impact: 'High' },
      { title: 'Use Descriptive Link Text', description: 'Write clear, descriptive anchor text instead of "click here"', impact: 'Medium' },
      { title: 'Add Image Alt Text', description: 'Include descriptive alt text for images to improve SEO', impact: 'Medium' }
    ]
  };

  // Utility functions
  function getScoreColor(score) {
    if (score >= 90) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  function generateId() {
    return 'lighthouse-' + Math.random().toString(36).substr(2, 9);
  }

  // Extract API recommendations from Lighthouse audits
  function extractApiRecommendations(audits) {
    const recommendations = {
      performance: [],
      accessibility: [],
      bestPractices: [],
      seo: []
    };
    
    // Performance recommendations
    const performanceAudits = [
      'largest-contentful-paint', 'first-contentful-paint', 'speed-index',
      'cumulative-layout-shift', 'total-blocking-time', 'render-blocking-resources',
      'unused-css-rules', 'unused-javascript', 'modern-image-formats',
      'efficiently-encode-images', 'offscreen-images', 'unminified-css',
      'unminified-javascript', 'server-response-time', 'uses-text-compression',
      'uses-rel-preconnect', 'uses-rel-preload', 'font-display'
    ];
    
    performanceAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1 && audit.title && audit.description) {
        const friendlyDescription = getFriendlyDescription(auditId, audit.description);
        const processedDesc = processDescription(friendlyDescription);
        recommendations.performance.push({
          title: audit.title,
          description: typeof processedDesc === 'string' ? processedDesc : processedDesc.text,
          learnMoreUrl: typeof processedDesc === 'object' ? processedDesc.learnMoreUrl : null,
          impact: getImpactLevel(audit.score),
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue || ''
        });
      }
    });
    
    // Accessibility recommendations
    const accessibilityAudits = [
      'color-contrast', 'image-alt', 'label', 'link-name',
      'button-name', 'document-title', 'html-has-lang',
      'meta-viewport', 'heading-order', 'skip-link',
      'focus-traps', 'focusable-controls', 'interactive-element-affordance'
    ];
    
    accessibilityAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1 && audit.title && audit.description) {
        const friendlyDescription = getFriendlyDescription(auditId, audit.description);
        const processedDesc = processDescription(friendlyDescription);
        recommendations.accessibility.push({
          title: audit.title,
          description: typeof processedDesc === 'string' ? processedDesc : processedDesc.text,
          learnMoreUrl: typeof processedDesc === 'object' ? processedDesc.learnMoreUrl : null,
          impact: getImpactLevel(audit.score),
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue || ''
        });
      }
    });
    
    // Best Practices recommendations
    const bestPracticesAudits = [
      'is-on-https', 'uses-http2', 'no-vulnerable-libraries',
      'external-anchors-use-rel-noopener', 'geolocation-on-start',
      'notification-on-start', 'no-document-write', 'js-libraries'
    ];
    
    bestPracticesAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1 && audit.title && audit.description) {
        const friendlyDescription = getFriendlyDescription(auditId, audit.description);
        const processedDesc = processDescription(friendlyDescription);
        recommendations.bestPractices.push({
          title: audit.title,
          description: typeof processedDesc === 'string' ? processedDesc : processedDesc.text,
          learnMoreUrl: typeof processedDesc === 'object' ? processedDesc.learnMoreUrl : null,
          impact: getImpactLevel(audit.score),
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue || ''
        });
      }
    });
    
    // SEO recommendations
    const seoAudits = [
      'document-title', 'meta-description', 'http-status-code',
      'link-text', 'is-crawlable', 'robots-txt', 'image-alt',
      'hreflang', 'canonical', 'font-size', 'tap-targets'
    ];
    
    seoAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1 && audit.title && audit.description) {
        const friendlyDescription = getFriendlyDescription(auditId, audit.description);
        const processedDesc = processDescription(friendlyDescription);
        recommendations.seo.push({
          title: audit.title,
          description: typeof processedDesc === 'string' ? processedDesc : processedDesc.text,
          learnMoreUrl: typeof processedDesc === 'object' ? processedDesc.learnMoreUrl : null,
          impact: getImpactLevel(audit.score),
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue || ''
        });
      }
    });
    
    return recommendations;
  }
  
  // Determine impact level based on audit score
  function getImpactLevel(score) {
    if (score === 0) return 'High';
    if (score < 0.5) return 'Medium';
    return 'Low';
  }

  // Process description text and convert URLs to "Learn More" links
  function processDescription(description) {
    if (!description) return '';
    
    // Regular expression to find URLs - more specific to avoid capturing trailing punctuation
    const urlRegex = /(https?:\/\/[^\s).,;]+)/g;
    const urls = description.match(urlRegex);
    
    if (!urls || urls.length === 0) {
      return description;
    }
    
    // Remove URLs from description and clean up
    let cleanDescription = description.replace(urlRegex, '').trim();
    
    // Clean up any trailing punctuation, parentheses, or extra spaces
    cleanDescription = cleanDescription.replace(/[.,)\s]+$/, '').trim();
    
    // Return description with Learn More link
    return {
      text: cleanDescription,
      learnMoreUrl: urls[0] // Use the first URL found
    };
  }

  // Get user-friendly descriptions for common audit recommendations
  function getFriendlyDescription(auditId, originalDescription) {
    const friendlyDescriptions = {
      // Performance
      'largest-contentful-paint': 'The main content on your page takes too long to load. This affects how quickly users can see and interact with your site.',
      'first-contentful-paint': 'Your page takes too long to show any content to users. Faster loading improves user experience.',
      'speed-index': 'Your page content loads slowly. Optimizing images and code can make your site feel much faster.',
      'cumulative-layout-shift': 'Elements on your page move around while loading, which can be frustrating for users trying to click buttons or read content.',
      'total-blocking-time': 'Scripts on your page are preventing users from interacting with it quickly. Optimizing JavaScript will make your site more responsive.',
      'render-blocking-resources': 'Some files are preventing your page from loading quickly. Moving or optimizing these files will speed up your site.',
      'unused-css-rules': 'Your site is loading CSS styles that aren\'t being used, which slows down loading time.',
      'unused-javascript': 'Your site is loading JavaScript code that isn\'t being used, which affects performance.',
      'modern-image-formats': 'Your images could be in more efficient formats (like WebP) to load faster and use less bandwidth.',
      'efficiently-encode-images': 'Your images aren\'t optimized, making them larger than necessary and slower to load.',
      'offscreen-images': 'Images that aren\'t visible when the page first loads should be loaded later to improve initial loading speed.',
      'unminified-css': 'Your CSS files contain extra spaces and comments that make them larger than necessary.',
      'unminified-javascript': 'Your JavaScript files contain extra spaces and comments that make them larger than necessary.',
      'server-response-time': 'Your web server takes too long to respond, which delays page loading for all visitors.',
      'uses-text-compression': 'Your text files aren\'t compressed, making them take longer to download.',
      'uses-rel-preconnect': 'Your site could load faster by connecting to external services earlier in the loading process.',
      'uses-rel-preload': 'Important resources could be loaded earlier to improve page speed.',
      'font-display': 'Your custom fonts could be set up to show text faster while the fonts are loading.',

      // Accessibility
      'color-contrast': 'Some text on your site is hard to read due to insufficient color contrast, making it difficult for users with vision impairments.',
      'image-alt': 'Some images are missing descriptions, making them inaccessible to screen readers and users with visual impairments.',
      'label': 'Some form fields are missing labels, making it difficult for users with disabilities to understand what information to enter.',
      'link-name': 'Some links don\'t have descriptive text, making it unclear where they lead for screen reader users.',
      'button-name': 'Some buttons don\'t have clear names, making it confusing for users with disabilities to understand their purpose.',
      'document-title': 'Your page is missing a title or has a generic title, which affects accessibility and SEO.',
      'html-has-lang': 'Your page doesn\'t specify its language, which can cause problems for screen readers and translation tools.',
      'meta-viewport': 'Your page isn\'t set up properly for mobile devices, which can cause accessibility and usability issues.',
      'heading-order': 'Your page headings aren\'t in the correct order, which can confuse screen reader users navigating your content.',
      'skip-link': 'Your page is missing a "skip to main content" link, making navigation difficult for keyboard users.',

      // Best Practices
      'is-on-https': 'Your website isn\'t using HTTPS, which means data sent between users and your site isn\'t encrypted and secure.',
      'uses-http2': 'Your server could use HTTP/2 to load your site faster and more efficiently.',
      'no-vulnerable-libraries': 'Your site is using outdated code libraries that have known security vulnerabilities.',
      'external-anchors-use-rel-noopener': 'Links to other websites should be set up more securely to protect your users.',
      'geolocation-on-start': 'Your site asks for location permission immediately, which can be annoying and suspicious to users.',
      'notification-on-start': 'Your site asks for notification permission immediately, which creates a poor user experience.',
      'no-document-write': 'Your site uses outdated JavaScript methods that can slow down page loading.',
      'js-libraries': 'Your site is using outdated JavaScript libraries that should be updated for better performance and security.',

      // SEO
      'document-title': 'Your page title is missing or not optimized, which hurts your search engine rankings.',
      'meta-description': 'Your page is missing a meta description, which is important for search engine results.',
      'http-status-code': 'Your page isn\'t returning the correct status code, which can hurt search engine indexing.',
      'link-text': 'Some of your links use generic text like "click here" instead of descriptive text that helps with SEO.',
      'is-crawlable': 'Search engines are being blocked from indexing your page, which will hurt your search rankings.',
      'robots-txt': 'Your robots.txt file has issues that might prevent search engines from properly indexing your site.',
      'hreflang': 'If your site serves multiple languages, it needs proper language tags for international SEO.',
      'canonical': 'Your page needs canonical tags to prevent duplicate content issues in search results.',
      'font-size': 'Some text on your page is too small for mobile users, which can hurt mobile search rankings.',
      'tap-targets': 'Some buttons and links on mobile are too small or too close together, making them hard to tap.'
    };

    return friendlyDescriptions[auditId] || originalDescription;
  }

  // API call to Cloudflare Pages Function
  async function callLighthouseAPI(targetUrl) {
    try {
      console.log('Calling Lighthouse API for:', targetUrl);
      
      const requestedCategories = ['performance', 'accessibility', 'best-practices', 'seo'];
      const strategy = 'mobile';
      
      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          strategy: strategy,
          categories: requestedCategories
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        if (response.status === 403) {
          throw new Error('API key is invalid or quota exceeded. Please check your Google API key.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      
      if (!data.lighthouseResult) {
        throw new Error('No Lighthouse results returned from API');
      }
      
      const lighthouseResult = data.lighthouseResult;
      const categoryResults = lighthouseResult.categories || {};
      
      // Extract API recommendations from audits
      const audits = lighthouseResult.audits || {};
      const apiRecommendations = extractApiRecommendations(audits);
      console.log(audits)
      console.log(apiRecommendations)
      
      const scores = {
        performance: Math.round((categoryResults.performance?.score || 0) * 100),
        accessibility: Math.round((categoryResults.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categoryResults['best-practices']?.score || 0) * 100),
        seo: Math.round((categoryResults.seo?.score || 0) * 100),
        url: targetUrl,
        timestamp: new Date().toISOString(),
        source: 'Google PageSpeed Insights',
        strategy: strategy,
        loadingExperience: data.loadingExperience?.overall_category || 'Unknown',
        originLoadingExperience: data.originLoadingExperience?.overall_category || 'Unknown',
        apiRecommendations: apiRecommendations
      };
      
      console.log('Successfully got Lighthouse data:', scores);
      return scores;
      
    } catch (error) {
      console.error('PageSpeed Insights API Error:', error);
      throw error;
    }
  }

  // Create the widget HTML
  function createWidgetHTML(title) {
    const widgetId = generateId();
    
    return `
      <div class="lighthouse-widget" id="${widgetId}">
        <h2 class="lighthouse-widget__title">${title}</h2>
        <form class="lighthouse-widget__form">
          <div class="lighthouse-widget__input-group">
            <label class="lighthouse-widget__label">Website URL</label>
            <input
              type="text"
              class="lighthouse-widget__input"
              placeholder="example.com"
              required
            />
          </div>
          <button type="submit" class="lighthouse-widget__submit-btn">
            Analyze Website
          </button>
          <div class="lighthouse-widget__loading" style="display: none;">
            <div class="lighthouse-widget__loading-spinner"></div>
            <p class="lighthouse-widget__loading-text">Analyzing website performance...</p>
          </div>
        </form>
        <div class="lighthouse-widget__results" style="display: none;">
          <h3 class="lighthouse-widget__results-title">Results</h3>
          <div class="lighthouse-widget__results-grid"></div>
          <div class="lighthouse-widget__results-meta"></div>
        </div>
      </div>
    `;
  }

  // Create results HTML
  function createResultsHTML(results) {
    let html = '';
    
    Object.entries(scoreDescriptions).forEach(([key, info]) => {
      const score = results[key];
      const scoreColor = getScoreColor(score);
      
      html += `
        <div class="lighthouse-widget__result-container">
          <div class="lighthouse-widget__result-row" data-category="${key}">
            <div class="lighthouse-widget__score lighthouse-widget__score--${scoreColor}">
              ${score}
            </div>
            <div class="lighthouse-widget__result-info">
              <h4 class="lighthouse-widget__result-title">
                ${info.title}
                <span class="lighthouse-widget__expand-icon">+</span>
              </h4>
              <p class="lighthouse-widget__result-description">${info.description}</p>
            </div>
          </div>
          <div class="lighthouse-widget__suggestions" style="display: none;">
            ${results.apiRecommendations && results.apiRecommendations[key] && results.apiRecommendations[key].length > 0 ? `
              <h5 class="lighthouse-widget__suggestions-title">Specific recommendations for your site:</h5>
              <div class="lighthouse-widget__api-recommendations">
                <div class="lighthouse-widget__recommendations-list">
                  ${results.apiRecommendations[key].map(recommendation => `
                    <div class="lighthouse-widget__recommendation lighthouse-widget__recommendation--api">
                      <div class="lighthouse-widget__recommendation-header">
                        <h6 class="lighthouse-widget__recommendation-title">${recommendation.title}</h6>
                        <div class="lighthouse-widget__recommendation-meta">
                          <span class="lighthouse-widget__impact lighthouse-widget__impact--${recommendation.impact.toLowerCase()}">
                            ${recommendation.impact} Impact
                          </span>
                          ${recommendation.score !== undefined ? `
                            <span class="lighthouse-widget__audit-score">Score: ${recommendation.score}%</span>
                          ` : ''}
                        </div>
                      </div>
                      <p class="lighthouse-widget__recommendation-description">${recommendation.description}</p>
                      ${recommendation.learnMoreUrl ? `
                        <a href="${recommendation.learnMoreUrl}" target="_blank" rel="noopener noreferrer" class="lighthouse-widget__learn-more">
                          Learn More
                        </a>
                      ` : ''}
                      ${recommendation.displayValue ? `
                        <p class="lighthouse-widget__recommendation-value">${recommendation.displayValue}</p>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div class="lighthouse-widget__no-recommendations">
                <div class="lighthouse-widget__success-message">
                  <div class="lighthouse-widget__success-icon">✓</div>
                  <h6 class="lighthouse-widget__success-title">Great job!</h6>
                  <p class="lighthouse-widget__success-description">
                    No specific issues found in this category. Your site is performing well for ${info.title.toLowerCase()}.
                  </p>
                </div>
              </div>
            `}
          </div>
        </div>
      `;
    });
    
    return html;
  }

  // Show/hide loading state
  function setLoadingState(container, isLoading, message = 'Analyzing website performance...') {
    const loading = container.querySelector('.lighthouse-widget__loading');
    const loadingText = container.querySelector('.lighthouse-widget__loading-text');
    const submitBtn = container.querySelector('.lighthouse-widget__submit-btn');
    const input = container.querySelector('.lighthouse-widget__input');
    
    if (isLoading) {
      loading.style.display = 'flex';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Analyzing...';
      input.disabled = true;
      loadingText.textContent = message;
    } else {
      loading.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Analyze Website';
      input.disabled = false;
    }
  }

  // Display results
  function displayResults(container, results) {
    const resultsContainer = container.querySelector('.lighthouse-widget__results');
    const resultsGrid = container.querySelector('.lighthouse-widget__results-grid');
    const resultsMeta = container.querySelector('.lighthouse-widget__results-meta');
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Add new results
    resultsGrid.innerHTML = createResultsHTML(results);
    
    // Add meta information
    resultsMeta.innerHTML = `
      <p class="lighthouse-widget__analyzed-url">
        <strong>Analyzed:</strong> ${results.url}
      </p>
      <p class="lighthouse-widget__analysis-time">
        <strong>Strategy:</strong> ${results.strategy} • <strong>Time:</strong> ${new Date(results.timestamp).toLocaleString()}
      </p>
    `;
    
    // Show results
    resultsContainer.style.display = 'block';
    
    // Add click handlers for expandable sections
    setupResultClickHandlers(container);
  }

  // Setup click handlers for expandable results
  function setupResultClickHandlers(container) {
    const resultRows = container.querySelectorAll('.lighthouse-widget__result-row');
    let expandedCategory = null;
    
    resultRows.forEach(row => {
      row.addEventListener('click', () => {
        const category = row.dataset.category;
        const suggestions = row.parentElement.querySelector('.lighthouse-widget__suggestions');
        const expandIcon = row.querySelector('.lighthouse-widget__expand-icon');
        
        // Collapse previously expanded category
        if (expandedCategory && expandedCategory !== category) {
          const prevRow = container.querySelector(`[data-category="${expandedCategory}"]`);
          const prevSuggestions = prevRow.parentElement.querySelector('.lighthouse-widget__suggestions');
          const prevIcon = prevRow.querySelector('.lighthouse-widget__expand-icon');
          
          prevSuggestions.style.display = 'none';
          prevIcon.textContent = '+';
          prevRow.classList.remove('lighthouse-widget__result-row--expanded');
        }
        
        // Toggle current category
        if (expandedCategory === category) {
          suggestions.style.display = 'none';
          expandIcon.textContent = '+';
          row.classList.remove('lighthouse-widget__result-row--expanded');
          expandedCategory = null;
        } else {
          suggestions.style.display = 'block';
          expandIcon.textContent = '−';
          row.classList.add('lighthouse-widget__result-row--expanded');
          expandedCategory = category;
        }
      });
    });
  }

  // Setup form submission
  function setupFormHandler(container) {
    const form = container.querySelector('.lighthouse-widget__form');
    const input = container.querySelector('.lighthouse-widget__input');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let url = input.value.trim();
      
      if (!url) {
        alert('Please enter a website URL');
        return;
      }
      
      // Auto-add https:// if no protocol is provided
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Basic URL validation
      try {
        new URL(url);
      } catch {
        alert('Please enter a valid website URL (e.g., google.com or example.com)');
        return;
      }
      
      try {
        setLoadingState(container, true, 'Preparing to analyze website...');
        
        setTimeout(() => setLoadingState(container, true, 'Running Lighthouse analysis...'), 1000);
        const results = await callLighthouseAPI(url);
        
        setLoadingState(container, true, 'Processing results...');
        setTimeout(() => {
          displayResults(container, results);
          setLoadingState(container, false);
        }, 500);
        
      } catch (error) {
        console.error('Error analyzing URL:', error);
        alert('Error: ' + (error.message || 'Error analyzing website. Please try again.'));
        setLoadingState(container, false);
      }
    });
  }

  // Initialize widget in a container
  function initWidget(container) {
    if (container.dataset.initialized) return;
    
    const title = container.dataset.title || 'Website Performance Analyzer';
    
    // Insert widget HTML
    container.innerHTML = createWidgetHTML(title);
    
    // Setup form handler
    setupFormHandler(container);
    
    // Mark as initialized
    container.dataset.initialized = 'true';
  }

  // Initialize all widgets on the page
  function initAllWidgets() {
    const containers = document.querySelectorAll(CONFIG.containerSelector);
    containers.forEach(initWidget);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllWidgets);
  } else {
    initAllWidgets();
  }

  // Expose global API
  window.LighthouseWidget = {
    init: initAllWidgets,
    initContainer: initWidget,
    config: CONFIG
  };

})();