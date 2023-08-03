import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';

import createHeaderTxt from './HeaderText';
import createBoardSelector from './BoardSelector';
import { getCRMSettingsByAccountId } from '../../services/offsite';
import UpdateSettingsCard from './UpdateSettings';

import { SELECT_NULL } from '../../constants';
import { saveSettingsAllowedFields, deleteSettingsAllowedFields } from '../../utils/localStorage';

export default function SettingsCard() {
	try {
		const { id, account } = getCurrentAccount();
		const { data } = fetchBoardItems();
		const { boards } = filterBoardByUser(id, data);
		const filteredBoards = filterSubitemBoards(boards);
		const { boardOptions } = mapBoardColumnsAndSelectOptions(filteredBoards);

		const exist = getCRMSettingsByAccountId(account.id);
		if (exist && exist.data) {
			const { board, allowedFields } = exist.data;
			saveSettingsAllowedFields(allowedFields);
			return UpdateSettingsCard({ currentBoard: board.value });
		}

		deleteSettingsAllowedFields();
		return newSettingsCard({ boardOptions });
	} catch (err) {
		console.log('SettingsCardErr=>', err);
	}
}

function newSettingsCard({ boardOptions }) {
	let cardDivider = CardService.newDivider();

	let selectInput = createBoardSelector();

	if (boardOptions.length) {
		selectInput.addItem('--Select--', SELECT_NULL, true);
		for (let b of boardOptions) {
			selectInput.addItem(b.label, b.value.toString(), false);
		}
	}

	const text = createHeaderTxt();
	let cardSection = CardService.newCardSection().addWidget(text).addWidget(cardDivider).addWidget(selectInput);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
