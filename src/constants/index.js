const BOARD_COLUMNS_MAPPING = {
	NAME: 'name',
	DATE: 'date',
	EMAIL: 'email',
	FILES: 'file',
	LINK: 'link',
	LONG_TEXT: 'long-text',
	NUMBERS: 'numeric',
	PERSON: 'multiple-person',
	PHONE: 'phone',
	RATING: 'rating',
	COLOR: 'color', // status
	TEXT: 'text',
	DROPDOWN: 'dropdown',
	BOARD_RELATION: 'board-relation',
	LOOKUP: 'lookup'
};
module.exports = {
	SELECT_NULL: 'No item selected',
	MENU_TABS: {
		CONTACT: 'Contact',
		UPDATES: 'Updates'
	},
	DEFUALT_FIELDS: [{ id: 'name', type: 'name', title: 'Item Name' }],
	BOARD_COLUMNS: BOARD_COLUMNS_MAPPING,
	SAMPLE_DATA: [
		{ id: 'name', type: 'name', title: 'Item Name', text: '', value: '' },
		{
			id: 'person',
			title: 'Person',
			type: 'multiple-person',
			value: null,
			text: ''
		},
		{
			id: 'email',
			title: 'Email',
			type: 'email',
			value: '{"text":"john@mailinator.com","email":"john@mailinator.com","changed_at":"2023-02-27T07:10:11.968Z"}',
			text: 'john@mailinator.com'
		},
		{
			id: 'connect_boards65',
			title: 'Deals',
			type: 'board-relation',
			value: '{"linkedPulseIds":[{"linkedPulseId":4039580595}]}',
			text: 'Deal 2'
		},
		{
			id: 'mirror4',
			title: 'Mirror Amount',
			type: 'lookup',
			value: null,
			text: '20000'
		},
		{
			id: 'connect_boards63',
			title: 'Company',
			type: 'board-relation',
			value: '{"linkedPulseIds":[{"linkedPulseId":4049101652}]}',
			text: 'Facebook'
		},
		{
			id: 'mirror_1',
			title: 'Mirro Est Date',
			type: 'lookup',
			value: null,
			text: '2023-02-01'
		},
		{
			id: 'status6',
			title: 'Status',
			type: 'color',
			value: '{"index":1,"post_id":null,"changed_at":"2023-07-20T07:22:38.938Z"}',
			text: 'Done'
		},
		{
			id: 'numbers',
			title: 'Numbers',
			type: 'numeric',
			value: '"2"',
			text: '2'
		},
		{
			id: 'numbers_1',
			title: 'Numbers 1',
			type: 'numeric',
			value: '"3"',
			text: '3'
		},
		{
			id: 'link',
			title: 'Link',
			type: 'link',
			value: '{"url":"https://www.google.com","text":"Google"}',
			text: 'Google - https://www.google.com'
		},
		{
			id: 'text',
			title: 'Text',
			type: 'text',
			value: '"Hello"',
			text: 'Hello'
		},
		{
			id: 'files',
			title: 'Files',
			type: 'file',
			value: '{"files":[{"name":"337565747_1722949634768453_1078533905337196220_n.jpg","assetId":964362023,"isImage":"true","fileType":"ASSET","createdAt":1689837801993,"createdBy":"35214999"}]}',
			text: 'https://binod-gang.monday.com/protected_static/13616779/resources/964362023/337565747_1722949634768453_1078533905337196220_n.jpg'
		},
		{
			id: 'date',
			title: 'Date',
			type: 'date',
			value: '{"date":"2023-07-08","changed_at":"2023-07-20T07:23:27.336Z"}',
			text: '2023-07-08'
		},
		{
			id: 'phone3',
			title: 'Phone',
			type: 'phone',
			value: '{"phone":"12324234234","changed_at":"2023-07-20T07:23:32.453Z","countryShortName":"NP"}',
			text: '12324234234'
		},
		{
			id: 'text_1',
			title: 'Company Name',
			type: 'text',
			value: '"Xcel Corp"',
			text: 'Xcel Corp'
		}
	]
};
