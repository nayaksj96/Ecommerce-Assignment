# GitHub Submission Guide

## Recommended Repository Structure

Push the whole folder as one repository:

```text
ecommerce-assignment/
|-- customer-service/
|-- frontend/
|-- product-order-service/
|-- docs/
|-- docker-compose.yml
`-- README.md
```

This is the cleanest structure for the assignment because the evaluator can see both microservices, the frontend, Docker setup, and documentation in one place.

## Recommended Commit Sequence

If you want the Git history to look intentional and recruiter-friendly, use a small set of clean commits like this:

1. `chore: scaffold product-order and customer Nest services`
2. `feat: add product, order, and customer domain modules`
3. `feat: implement RabbitMQ order sync between microservices`
4. `feat: add Next.js storefront and checkout flow`
5. `docs: add setup guide, API examples, and demo notes`
6. `fix: align docker ports, env loading, and relation mappings`

If you do not want multiple commits, one clean final commit is also acceptable:

1. `feat: complete ecommerce microservices assignment`

## Commands To Initialize And Push

Run from the project root:

```bash
git init
git branch -M main
git add .
git commit -m "feat: complete ecommerce microservices assignment"
```

Then create an empty public GitHub repository and run:

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Before Pushing

Check these items:

- `.env` files are excluded if you do not want to publish local credentials
- `README.md` explains setup clearly
- Docker ports match your actual working setup
- the demo video link is ready or planned
- the repository is public

## Suggested Final Repo Description

Use something short like:

`NestJS microservices e-commerce assignment using PostgreSQL, RabbitMQ, and Next.js`
