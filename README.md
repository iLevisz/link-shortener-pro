# Link Shortener Pro API

npm install
npx prisma generate
npx prisma db push
npm run dev

curl -X POST http://localhost:3000/api/v1/links \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -H "x-idempotency-key: 12345" \
  -d '{"originalUrl": "https://example.com"}'

curl -i http://localhost:3000/SLUG