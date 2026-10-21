import fs from 'fs';
const file = 'Public Sector Backend.postman_collection.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

let adminFolder = data.item.find(i => i.name === 'Admin');

// Add Invites -> Revoke
let invitesFolder = adminFolder.item.find(i => i.name === 'Invites');
if (invitesFolder) {
  invitesFolder.item.push({
    name: "POST /admin/invites/:id/revoke - Success",
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

// Add Reports folder
let reportsFolder = adminFolder.item.find(i => i.name === 'Reports');
if (!reportsFolder) {
  reportsFolder = {
    name: "Reports",
    item: [
      {
        name: "GET /admin/reports - Success",
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
  };
  adminFolder.item.push(reportsFolder);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log("Postman collection updated.");
