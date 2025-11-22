# Project Task Document

---

## 1. New Features in User Dashboard//

- **AI Essay Grader** (in User Dashboard)  
- **AI Essay Writer** (in User Dashboard)  

Examples:  

- https://galaxy.ai/ai-essay-generator  
- https://notegpt.io/ai-grader  

---

## 2. ✅ COMPLETED: Migrate PDF and Object Storage from Uploadthing to Cloudflare R2 Storage//

- ✅ Migrated from Uploadthing to Cloudflare R2 storage
- ✅ All file uploads now use R2 (S3-compatible)
- ✅ No vendor lock-in, lower costs, better reliability
- ✅ Migration scripts created for existing files

---

## 3. Improve Landing Page

- Improve first and second hero section on homepage.  
- Add features section with 3 blocks:   
  - Title+Description on left and Image on right
  - Image on left and Title + Description on right
  - Title+Description on left and Image on right
- See the attached homepage PDF file.  

---

## 4. Add Admin Panel//

- User details and last usage  
- Subscription details  
- User IP during registration  
- Allow to delete / ban / cancel subscription through admin panel  (sync with stripe and database)
- Export user  email

Usage details are important to counter false chargeback dispute on Stripe. Many users will use the service and in the end of month initiate chargeback. Common practice.  

---

## 5. Auth Improvement//

- Migrate to Better Auth  
- Add Google Login and Signup  
- Keep the login page URL slug and signup page URL slug separate (currently its separate)  
- Add Cloudflare Turnstile Captcha on Signup page  

---

## 6. File Uploads//

- Allow users to upload DOC, DOCX, MD and TXT files too (along with PDF).  
- Allow users to fetch a webpage URL text using JINA.AI API and store the content for chat.  
- https://jina.ai/  

---

## 7. Extra Public Sub-Pages to be Added//

### Alternatives Pages

- Page Title: **Best TurboLearn Alternative**  
  
  - URL Slug: `example.com/turbolearn-alternative`  

- Page Title: **Best NotebookLM Alternative**  
  
  - URL Slug: `example.com/notebooklm-alternative`  

### AI Note Taker Page//

- Page Title: **AI Note Taker App**  
  - URL Slug: `example.com/ai-note-taker`  
- Example: https://tactiq.io/ai-tools/ai-note-taker  

---

## 8. Library Feature//

- Add Library feature like Jenni.ai where users can combine multiple notes in one topic.  

---

## 9. Subscription Plans//

- Currently there is Free Plan and Pro Plan with some limits. Keep these as it is.  
- Add one more plan: **Max Plan**  
  - Unlimited uploads, chats, summary, etc.  
  - Make sure to allow unlimited or limited usage from codebase.  
- Update Popup and Pricing section to show this new Max plan too.  

---

## 10. Fix Podcast Integration//

- In current codebase state Podcast is not working properly.  
- Currently storing in local server instead of Cloudflare R2.  
- Generate podcast audio should be stored in separate R2 Bucket.  
- Use separate bucket API for DOCS storage and another R2 Bucket API for Audio Stream and Storage.  
- When user clicks to regenerate podcast then delete the old generated audio of the same notes.  
- Auto delete podcast audio after 30 days. User can regenerate it anytime.  
- Use Correct API endpoints: Text-to-Dialogue API endpoints.  

### 

### My Conversation with ElevenLabs Support Team

**Mail 1:**  

- Suggestion: Use Text-to-Dialogue API for programmatic control.  
- Docs:  
  - https://elevenlabs.io/docs/capabilities/text-to-dialogue  
  - https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert  
  - https://elevenlabs.io/docs/api-reference/text-to-dialogue/stream  

**Mail 2:**  

- Studio podcast feature available in dashboard (Enterprise API only).  
- For API integration use Text-to-Dialogue API endpoints.  
- Docs:  
  - https://elevenlabs.io/docs/cookbooks/text-to-dialogue  
- GitHub project “podcastfy” also uses Text-to-Dialogue endpoints.  

**My Conclusion:**  

- Text-to-Dialogue is closer to Google Podcast API.  
- If Google Podcast API becomes available, it would be better since NotebookLM also uses it.  But I am not sure they will give access to small customer for it. Need to check it
- References:  
  - https://cloud.google.com/gemini/enterprise/docs/reference/rest/v1/projects.locations.podcasts.operations?hl=en  

---

## 11. Refgrow API Integration for Affiliate//

- Affiliate system integration (similar to previous integration)
  
  Generate tracking code in lowercase format:  
  - Example: `https://example.com/?ref=amitcode`  

---

## 12. Important Instructions

- **Do Not Change** the Onboarding Flow  
- **Do Not Change** the Popup Flow  

---


