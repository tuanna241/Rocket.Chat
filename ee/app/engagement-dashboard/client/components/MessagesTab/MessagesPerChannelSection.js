import { ResponsivePie } from '@nivo/pie';
import { Box, Flex, Grid, Icon, Margins, Select, Skeleton, Table, Tile } from '@rocket.chat/fuselage';
import moment from 'moment';
import React, { useMemo, useState } from 'react';

import { useTranslation } from '../../../../../../client/contexts/TranslationContext';
import { LegendSymbol } from '../data/LegendSymbol';
import { useEndpointData } from '../../hooks/useEndpointData';
import { Section } from '../Section';

export function MessagesPerChannelSection() {
	const t = useTranslation();

	const periodOptions = useMemo(() => [
		['last 7 days', t('Last 7 days')],
		['last 30 days', t('Last 30 days')],
		['last 90 days', t('Last 90 days')],
	], [t]);

	const [periodId, setPeriodId] = useState('last 7 days');

	const period = useMemo(() => {
		switch (periodId) {
			case 'last 7 days':
				return {
					start: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(7, 'days'),
					end: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1),
				};

			case 'last 30 days':
				return {
					start: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(30, 'days'),
					end: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1),
				};

			case 'last 90 days':
				return {
					start: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(90, 'days'),
					end: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1),
				};
		}
	}, [periodId]);

	const handlePeriodChange = (periodId) => setPeriodId(periodId);

	const params = useMemo(() => ({
		start: period.start.toISOString(),
		end: period.end.toISOString(),
	}), [period]);

	const pieData = useEndpointData('GET', 'engagement-dashboard/messages/origin', params);
	const tableData = useEndpointData('GET', 'engagement-dashboard/messages/top-five-popular-channels', params);

	const [pie, table] = useMemo(() => {
		if (!pieData || !tableData) {
			return [];
		}

		const pie = pieData.origins.reduce((obj, { messages, t }) => ({ ...obj, [t]: messages }), {});

		const table = tableData.channels.reduce((entries, { t, messages, name, usernames }, i) =>
			[...entries, { i, t, name: name || usernames.join(' × '), messages }], []);

		return [pie, table];
	}, [period, pieData, tableData]);

	return <Section
		title={t('Where are the messages be sent?')}
		filter={<Select options={periodOptions} value={periodId} onChange={handlePeriodChange} />}
	>
		<Grid>
			<Grid.Item md={4}>
				<Flex.Item align='stretch' grow={1} shrink={0}>
					<Box>
						<Flex.Container alignItems='center' wrap='no-wrap'>
							{pie
								? <Box>
									<Flex.Item grow={1} shrink={1}>
										<Margins inline='x24'>
											<Box style={{ position: 'relative', height: 300 }}>
												<Box style={{ position: 'absolute', width: '100%', height: '100%' }}>
													<ResponsivePie
														data={[
															{
																id: 'd',
																label: t('Private chats'),
																value: pie.d,
																color: '#FFD031',
															},
															{
																id: 'c',
																label: t('Private channels'),
																value: pie.c,
																color: '#2DE0A5',
															},
															{
																id: 'p',
																label: t('Public channels'),
																value: pie.p,
																color: '#1D74F5',
															},
														]}
														innerRadius={0.6}
														colors={['#FFD031', '#2DE0A5', '#1D74F5']}
														enableRadialLabels={false}
														enableSlicesLabels={false}
														animate={true}
														motionStiffness={90}
														motionDamping={15}
														theme={{
															// TODO: Get it from theme
															axis: {
																ticks: {
																	text: {
																		fill: '#9EA2A8',
																		fontFamily: 'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',
																		fontSize: 10,
																		fontStyle: 'normal',
																		fontWeight: '600',
																		letterSpacing: '0.2px',
																		lineHeight: '12px',
																	},
																},
															},
															tooltip: {
																container: {
																	backgroundColor: '#1F2329',
																	boxShadow: '0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)',
																	borderRadius: 2,
																},
															},
														}}
														tooltip={({ value }) => <Box textStyle='p2' textColor='alternative'>
															{t('%d messages', value)}
														</Box>}
													/>
												</Box>
											</Box>
										</Margins>
									</Flex.Item>
									<Flex.Item basis='auto'>
										<Margins block='neg-x4'>
											<Box>
												<Margins block='x4'>
													<Box textColor='info' textStyle='p1'>
														<LegendSymbol color='#FFD031' />
														{t('Private chats')}
													</Box>
													<Box textColor='info' textStyle='p1'>
														<LegendSymbol color='#2DE0A5' />
														{t('Private channels')}
													</Box>
													<Box textColor='info' textStyle='p1'>
														<LegendSymbol color='#1D74F5' />
														{t('Public channels')}
													</Box>
												</Margins>
											</Box>
										</Margins>
									</Flex.Item>
								</Box>
								: <Skeleton variant='rect' height={300} />}
						</Flex.Container>
					</Box>
				</Flex.Item>
			</Grid.Item>
			<Grid.Item md={4}>
				<Margins blockEnd='x16'>
					<Box textStyle='p1'>{t('Most popular Channels (Top5)')}</Box>
				</Margins>
				{(table && table.length && <Table>
					<Table.Head>
						<Table.Row>
							<Table.Cell>{t('#')}</Table.Cell>
							<Table.Cell>{t('Channel')}</Table.Cell>
							<Table.Cell align='end'>{t('Number of messages')}</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{table.map(({ i, t, name, messages }) => <Table.Row key={i}>
							<Table.Cell>{i + 1}.</Table.Cell>
							<Table.Cell>
								<Margins inlineEnd='x4'>
									{(t === 'd' && <Icon name='at' />)
									|| (t === 'c' && <Icon name='lock' />)
									|| (t === 'p' && <Icon name='hashtag' />)}
								</Margins>
								{name}
							</Table.Cell>
							<Table.Cell align='end'>{messages}</Table.Cell>
						</Table.Row>)}
					</Table.Body>
				</Table>)
				|| (table && !table.length && <Tile textStyle='p1' textColor='info' style={{ textAlign: 'center' }}>
					{t('Not enough data')}
				</Tile>)}
			</Grid.Item>
		</Grid>
	</Section>;
}
