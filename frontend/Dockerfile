FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Client components inline NEXT_PUBLIC_* at compile time; the browser calls the
# host-mapped backend port, so localhost is correct here.
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

EXPOSE 3000
CMD ["npm", "run", "dev"]
