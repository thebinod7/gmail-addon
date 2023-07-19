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
	BOARD_COLUMNS: BOARD_COLUMNS_MAPPING,
	SAMPLE_DATA: [
		{ id: 'name', name: 'name', title: 'Item Name', type: 'text', value: '' },
		{
			id: 'email',
			name: 'email',
			title: 'Email Address',
			type: 'text',
			value: ''
		},
		{
			id: 'phone',
			name: 'phone',
			title: 'Phone Number',
			type: 'text',
			value: ''
		},
		{
			id: 'dropdown',
			name: 'dropdown',
			title: 'Dropdown',
			type: 'dropdown',
			value: ''
		},
		{
			id: 'dropdown1',
			name: 'dropdown1',
			title: 'Dropdown 1',
			type: 'dropdown',
			value: ''
		}
	]
};
