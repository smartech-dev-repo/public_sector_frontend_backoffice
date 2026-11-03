import fs from 'fs';
const file = 'Public Sector Backend.postman_collection.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
let adminFolder = data.item.find(i => i.name === 'Admin');
let authFolder = adminFolder.item.find(i => i.name === 'Auth');

if (authFolder) {
  authFolder.item.push({
    name: "POST /auth/login (Generic)",
    request: {
      method: "POST",
      header: [],
      body: { mode: "raw", raw: "{\n  \"email\": \"\",\n  \"password\": \"\"\n}", options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/login", host: ["{{base_url}}"], path: ["auth", "login"] }
    }
  });
  authFolder.item.push({
    name: "POST /auth/agent/login",
    request: {
      method: "POST",
      header: [],
      body: { mode: "raw", raw: "{\n  \"email\": \"\",\n  \"password\": \"\"\n}", options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/agent/login", host: ["{{base_url}}"], path: ["auth", "agent", "login"] }
    }
  });
  authFolder.item.push({
    name: "POST /auth/client/otp/request",
    request: {
      method: "POST",
      header: [],
      body: { mode: "raw", raw: "{\n  \"phone\": \"\"\n}", options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/client/otp/request", host: ["{{base_url}}"], path: ["auth", "client", "otp", "request"] }
    }
  });
  authFolder.item.push({
    name: "POST /auth/client/otp/verify",
    request: {
      method: "POST",
      header: [],
      body: { mode: "raw", raw: "{\n  \"phone\": \"\",\n  \"code\": \"\"\n}", options: { raw: { language: "json" } } },
      url: { raw: "{{base_url}}/auth/client/otp/verify", host: ["{{base_url}}"], path: ["auth", "client", "otp", "verify"] }
    }
  });
  authFolder.item.push({
    name: "GET /auth/profile",
    request: {
      method: "GET",
      header: [ { key: "Authorization", value: "Bearer {{admin_access_token}}" } ],
      url: { raw: "{{base_url}}/auth/profile", host: ["{{base_url}}"], path: ["auth", "profile"] }
    }
  });
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
