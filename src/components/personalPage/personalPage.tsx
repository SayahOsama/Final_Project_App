import React, { useEffect, useState } from 'react';
import { AuthApi } from '../../api/authApi';
import { Loader } from '../loader/loader';
import {Pagination, Card, Image, Text, Container, Grid, Badge, Flex, Title, AspectRatio, Button, Box } from '@mantine/core';
import { ErrorMessage } from '../error/error';
import { Page, isAPIStatusEnum } from '../main/main-page';
import { chunk } from '../eventsCatalog/eventsCatalog';
import { format } from 'date-fns';


export const PersonalPage:React.FC<Page> = ({username,setNextEvent}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [activePage, setPage] = useState(1);
  const [getMoreOrders, setGetMoreOrders] = useState<boolean>(true);
  const [orders, setOrders] = useState<any>([]);

  const handleButton = async (id:string,orderId:string) => {
    const res = await AuthApi.refundPayment(orderId);
    if(res.status == 200){
      const refund = await AuthApi.deleteOrder(username,id);
      if(!isAPIStatusEnum(refund)){
        const updatedOrders = orders.filter((order:any) => order.orderDetails._id !== id);
        setOrders(updatedOrders);
        setData(chunk(
          updatedOrders,
          3
        ));
        const res = await AuthApi.getNextEvent(username);
        if(res == ''){
          setNextEvent('');
          return;
        }
        if (!isAPIStatusEnum(res)) {
          const date = format(new Date(res.start_date), 'MMMM dd, yyyy, hh:mm a');
          const title = res.title;
          setNextEvent(`${title} (${date})`);
        }
        return;
      }else{
        setIsLoading(false);
        setErrorMessage('Failed to refund the order, please try again');
        return;
      }
    }else{
      setIsLoading(false);
      setErrorMessage('Failed to refund the order, please try again');
      return;
    }
  }

  const getUserOrders = async (limit:number = 50,skip:number = 0) => {
    const res = await AuthApi.getOrders(username);
    if(!isAPIStatusEnum(res)){
        const orders = await Promise.all(res.data.map(async (order:any) => {
          const event = await AuthApi.getEvent(order.eventID);
          if(!isAPIStatusEnum(event)){
            return {orderDetails: order, eventDetails: event.data};
          }else{
            setIsLoading(false);
            setErrorMessage('Failed to get The event details, please try again');
            return;
          }
        }));
        setOrders(orders);
        setData(chunk(
            orders,
            3
        ));
        return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get The Orders, please try again');
    }
  }

  useEffect(() => {
    setIsLoading(true);
    getUserOrders().then(() => {setIsLoading(false)});
  }, []);

  useEffect(() => {
    if(getMoreOrders && data && activePage === data.length){
        const getMoreOrders = async () =>{
            setIsLoading(true);
            const res = await AuthApi.getOrders(username,50,orders.length);
              if(!isAPIStatusEnum(res)){
                if(res.data.length === 0){
                  setGetMoreOrders(false);
                  return;
                }
                const newOrders = await Promise.all(res.data.map(async (order:any) => {
                  const event = await AuthApi.getEvent(order.eventID);
                  if(!isAPIStatusEnum(event)){
                    return {orderDetails: order, eventDetails: event.data};
                  }else{
                    setIsLoading(false);
                    setErrorMessage('Failed to get The event details, please try again');
                    return;
                  }
                }));
                setOrders(orders.concat(newOrders));
                setData(chunk(
                    orders,
                    3
                ));
                const newData = chunk(
                    data[activePage-1].concat(newOrders),
                    3
                );
                data.pop();
                setData(data.concat(newData));
                return;
            }else{
                setIsLoading(false);
                setErrorMessage('Failed to get more orders, please try again');
            }
        }
        getMoreOrders().then(() => {setIsLoading(false)});
      }
  }, [activePage]);


  const cards = data ? data[activePage - 1]?.map((order:any,index:number) => {
    let price: number = 0;
    order.eventDetails.tickets.map((ticket: any) => {
      if(ticket.name == order.orderDetails.ticketType){
        price = ticket.price;
      }
    })
    return(
      <Flex style={{maxWidth: '95%'}} key={index+12*(activePage-1)} justify="center" align="center" direction="column">
      <Grid.Col key={index+12*(activePage-1)} span={{ base: 12, xs: 12,sm: 12,md: 12, lg: 12, xg: 4 }}>
      <Card style={{width: 'fit-content'}} shadow="lg" p="md" radius="md" component="a" className="card">
      <Flex justify="flex-start" align="start" direction="row" columnGap="xl">
        <Flex style={{minWidth: 'fit-content',minHeight: 'fit-content'}} justify="flex-start" direction="column">
          <Text size="sm" fw={700} mt="md">
            OrderId: {order.orderDetails.orderID}
          </Text>
            <Text size="sm" fw={700} mt="md">
              Tickets: {order.orderDetails.ticketQuantity} x {order.orderDetails.ticketType} Ticket
            </Text>
            <Text size="sm" fw={700} mt="md">
              Total Price: {parseInt(order.orderDetails.ticketQuantity)*price}$
            </Text>
          <Text size="xs" fw={700} mt="md">
            Purchased At: {format(new Date(order.orderDetails.timeOfPurchase), 'MMMM dd, yyyy, hh:mm a')}
          </Text>
          <br/>
          <Flex justify="center" align="center">
            {new Date(order.eventDetails.start_date) > (new Date()) ? <Button style={{marginBottom: '3px',width:'fit-content'}} onClick={() => handleButton(order.orderDetails._id,order.orderDetails.orderID)} size="compact-sm" variant="filled">Refund</Button>: null}
          </Flex>
        </Flex>
        <Flex justify="center" align="center" direction="column">
              <Flex justify="flex-start" direction="row" columnGap="xl">
                <Flex justify="flex-start" direction="column">
                  <Title order={4} className="title" mt={5}>
                    {order.eventDetails.title}
                  </Title>
                  <Image style={{maxWidth:'200px', maxHeight:'150px', minHeight: '150px', minWidth: '200px'}} src={order.eventDetails.image} />
                </Flex>
                <Flex  justify="flex-start" direction="column">
                    <Text size="sm" fw={700} mt="md">
                      Event Starts At: {format(new Date(order.eventDetails.start_date), 'MMMM dd, yyyy, hh:mm a')}
                    </Text>
                    <Text size="sm" fw={700} mt="md">
                      Event ends At: {format(new Date(order.eventDetails.end_date), 'MMMM dd, yyyy, hh:mm a')}
                    </Text>
                    <Text size="sm" fw={700} mt="md">
                      Event By: {order.eventDetails.organizer}
                    </Text>
                    <Text style={{maxWidth: '300px'}} lineClamp={4} size="xs" fw={500} mt="md">
                      Description: {order.eventDetails.description}
                    </Text>
                  </Flex>
              </Flex>
              <Badge style={{marginRight: '3px'}} className="rating" variant="gradient" gradient={{ from: 'blue', to: 'green' }}>
                  {order.eventDetails.category}
              </Badge>
          </Flex>
          </Flex>
      </Card>
  </Grid.Col>
  </Flex>
  )}) : null;

  return (
    <div>
      {isLoading 
      ? <Loader /> 
      : <Container fluid py="xl">
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            <Title order={3} className="title" mt={5}>
              Orders History: {orders.length == 0 ? 'No Orders': ''}
            </Title>
            <br/>
            <Grid justify="center" align="center" gutter="xl">
                {cards}
            </Grid>
            <Flex style={{marginTop:'20px'}} justify="center" align="center">
                <Pagination withEdges total={data?.length} value={activePage} onChange={setPage} mt="sm" />
            </Flex>
        </Container>
      }
    </div>
  );
}
