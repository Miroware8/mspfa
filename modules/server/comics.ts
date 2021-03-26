import db from 'modules/server/db';
import type { Quirk } from 'modules/server/quirks';

export type ComicPage = {
	published: Date,
	title: string,
	content: string,
	nextPages: number[],
	tags: string[],
	hidden: boolean,
	commentary?: string
};

export type ComicPageDraft = ComicPage & {
	notify: boolean
};

export enum ComicStatus {
	Inactive = 0,
	Ongoing,
	Complete,
	Discontinued
}

export type ComicComment = {
	posted: Date,
	edited?: Date,
	page: number,
	author: number,
	content: string,
	likes: string[],
	dislikes: string[],
	private: boolean
};

export type ComicColor = {
	value: string,
	name: string
};

export type ComicDocument = {
	_id: number,
	created: Date,
	updated: Date,
	title: string,
	status: ComicStatus,
	owner: string,
	editors: string[],
	author?: {
		name: string,
		site: string
	},
	pages: ComicPage[],
	drafts: ComicPageDraft[],
	description: string,
	icon: string,
	banner: string,
	style: string,
	disableUserTheme: boolean,
	script: {
		unverified: string,
		verified: string
	},
	tags: string[],
	commentsEnabled: boolean,
	comments: ComicComment[],
	/** Properties of the comic which are only used in the comic editor. */
	editorSettings: {
		defaultPageTitle: ComicPage['title'],
		defaultSpoiler: {
			openLabel: string,
			closeLabel: string
		},
		colors: ComicColor[]
	},
	quirks: Quirk[]
};

const comics = db.collection<ComicDocument>('comics');

export default comics;