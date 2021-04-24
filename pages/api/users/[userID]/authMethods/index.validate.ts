// This file is automatically generated by `scripts/generate-validators`. Do not edit directly.

import { createValidator } from 'modules/server/api';

export default createValidator({
	$schema: 'http://json-schema.org/draft-07/schema#',
	$ref: '#/definitions/RequestMethod',
	definitions: {
		RequestMethod: {
			type: 'string',
			const: 'GET'
		}
	}
}, {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$ref: '#/definitions/Request',
	definitions: {
		Request: {
			type: 'object',
			additionalProperties: false,
			properties: {
				body: {},
				query: {
					type: 'object',
					properties: {
						userID: {
							type: 'string'
						},
						type: {
							type: 'string',
							enum: [
								'google',
								'discord',
								'password'
							]
						}
					},
					required: [
						'userID'
					],
					additionalProperties: false
				},
				method: {
					type: 'string',
					const: 'GET'
				}
			},
			required: [
				'method',
				'query'
			]
		}
	}
});