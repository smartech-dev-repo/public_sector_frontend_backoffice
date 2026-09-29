const fs = require('fs');
const file = 'Public Sector Backend.postman_collection.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Find Admin -> Invites folder
let adminFolder = data.item.find(i => i.name === 'Admin');
let invitesFolder = adminFolder.item.find(i => i.name === 'Invites');

if (invitesFolder) {
  invitesFolder.item.push({
    name: "POST /admin/invites/:id/revoke",
    request: {
      method: "POST",
      header: [
        { key: "Authorization", value: "Bearer {{admin_access_token}}" }
      ],
      url: {
        raw: "{{base_url}}/admin/invites/{{invite_id}}/revoke",
        host: ["{{base_url}}"],
        path: ["admin", "invites", "{{invite_id}}", "revoke"]
      }
    }
  });
}

// Reports folder
adminFolder.item.push({
  name: "Reports",
  item: [
    {
      name: "GET /admin/reports",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{admin_access_token}}" }
        ],
        url: {
          raw: "{{base_url}}/admin/reports",
          host: ["{{base_url}}"],
          path: ["admin", "reports"]
        }
      }
    }
  ]
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Added endpoints.");
