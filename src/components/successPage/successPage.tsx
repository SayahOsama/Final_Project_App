import React from 'react'
import { Page, isAPIStatusEnum } from '../main/main-page'
import { Card, Flex, Title, Text, Button } from '@mantine/core'
import { AuthApi } from '@/api/authApi'
import { format } from 'date-fns'

export const SuccessPage:React.FC<Page> = ({username,ticketDetails,orderId,setCurrentPage,setPurchased,setReserved,setNextEvent}) => {

  const handleButton = async () => {
    setPurchased(false);
    setReserved(false);
    const res = await AuthApi.getNextEvent(username);
      if(res == ''){
        setNextEvent('');
        return;
      }
      if (!isAPIStatusEnum(res)) {
        const date = format(new Date(res.start_date), 'MMMM dd, yyyy, h:mm a');
        const title = res.title;
        setNextEvent(`${title} (${date})`);
      }
    setCurrentPage('main');
  }

  return (
    <Flex justify="center" align="center" direction="column">
      <Card style={{width: 'fit-content'}} shadow="lg" p="md" radius="md" component="a">
        <Flex justify="flex-start" align="center" direction="column">
          <Text size="sm" fw={700} mt="md">
            Congratulation! Enjoy!
          </Text>
          <Text size="sm" fw={700} mt="md">
            orderId: {orderId}
          </Text>
          <br/>
          <Title order={4} className="title" mt={5}>
            {ticketDetails?.eventTilte}
          </Title>
          <Flex  justify="flex-start" direction="row" columnGap="xl"> 
            <Text size="sm" fw={700} mt="md">
              {ticketDetails?.amount} x {ticketDetails?.ticketType} Ticket
            </Text>
            <Text size="sm" fw={700} mt="md">
              Total Price: {ticketDetails ? ticketDetails?.amount * parseInt(ticketDetails?.ticketPrice) : 0}$
            </Text>
          </Flex>
          <br/>
          <Button onClick={() => handleButton()} size="compact-sm" variant="filled">Return to Events Catalog</Button>
        </Flex>
      </Card>
    </Flex>
  )
}
