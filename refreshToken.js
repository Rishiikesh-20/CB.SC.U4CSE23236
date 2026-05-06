import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const clientID = process.env.CLIENT_ID || '26ec4e96-477f-45e4-9eb2-ae27d4282771';
const clientSecret = process.env.CLIENT_SECRET || 'dFMsPADByMUUCxkb';
const authEndpoint = 'http://20.207.122.201/evaluation-service/auth';

async function refreshToken() {
	try {
		console.log('Requesting new access token...');
		
		const response = await axios.post(authEndpoint, {
			email: 'cb.sc.u4cse23236@cb.students.amrita.edu',
			name: 'rishiikesh s k',
			rollNo: 'cb.sc.u4cse23236',
			accessCode: 'PTBMmQ',
			clientID,
			clientSecret
		}, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const newToken = response.data.access_token;
		console.log('✓ New token received');
		
		const envPath = path.resolve('.env');
		let envContent = fs.readFileSync(envPath, 'utf-8');
		
		envContent = envContent.replace(
			/ACCESS_TOKEN="[^"]*"/,
			`ACCESS_TOKEN="${newToken}"`
		);
		
		fs.writeFileSync(envPath, envContent);
		console.log('✓ .env updated with new token');
		console.log('\nToken expires in:', response.data.expires_in, 'seconds');
		
	} catch (error) {
		console.error('✗ Failed to refresh token:', error.response?.data || error.message);
		process.exit(1);
	}
}

refreshToken();
