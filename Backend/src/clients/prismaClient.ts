import { PrismaPg } from '@prisma/adapter-pg';
import pg from "pg";
import { PrismaClient } from '../../generated/prisma/client';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool);
const pc = new PrismaClient({ adapter });
export default pc;
