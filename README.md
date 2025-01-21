![image](https://github.com/user-attachments/assets/a2898cae-e0e0-496e-a3e9-a410b7e38e80)

**The use of [yt-dlp](https://github.com/yt-dlp/yt-dlp) to download videos must comply with the legal and ethical guidelines of the platform hosting the video. It is prohibited to use this tool to download content for any unlawful purpose, including but not limited to copyright infringement, unauthorized redistribution, or exploitation of the content. Users are responsible for ensuring their actions are in compliance with relevant laws and platform terms of service. This tool should only be used for personal, educational, or lawful purposes!**

--- 

Before you begin, make sure you have the following installed:
1. **Node.js** 
   Install Node.js from https://nodejs.org.
2. **Python 3**
   Download it from https://www.python.org/downloads.

## Step 1: Create your OpenAI API Key
To get started, create your OpenAI API key by visiting the following link: https://platform.openai.com/api-keys. 
Once you have your key, copy it.

## Step 2: Set up your environment
In your terminal, run the following command to set up your environment:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env && npm i && pip install yt-dlp && npm db push
```
Make sure to replace your_api_key_here with the actual API key you copied in Step 1.

## Step 3: You're done!
```bash
npm dev
```

## List of supported sites for download:
https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md

