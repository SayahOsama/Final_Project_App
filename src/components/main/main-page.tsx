import React, { useEffect, useState } from 'react';
import './main-page.css'; 
import { AuthApi } from '../../api/authApi';
import { Loader } from '../loader/loader';
import { APIStatus, PageProps } from '../../types';
import { ErrorMessage } from '../error/error';
import { AppShell, Burger, Button, Flex,useMantineColorScheme,useComputedColorScheme, Badge, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PersonalPage } from '../personalPage/personalPage';
import { EventsCatalog } from '../eventsCatalog/eventsCatalog';
import { format } from 'date-fns';
import { EventPage } from '../eventPage/eventPage';
import { CheckoutPage } from '../checkoutPage/checkoutPage';
import { ticketDetails } from '../eventPage/eventPage'
import { SuccessPage } from '../successPage/successPage';
import { BOEventsCatalog } from '../BOEventsCatalog/BOEventsCatalog';
import { BOEventPage } from '../BOEventPage/BOEventPage';
import { AddNewEventPage } from '../AddNewEventPage/AddNewEventPage';

// Type guard to check if a value is of type EventEnum
export function isAPIStatusEnum(value: any): value is APIStatus {
  return Object.values(APIStatus).includes(value);
}

export interface Page {
  setCurrentPage: (value :string) => void;
  setEventDetails: (value: any) => void;
  eventDetails: any;
  setTicketDetails: (value: any) => void;
  ticketDetails?: ticketDetails;
  username: string;
  orderId: string;
  setOrderId: (value: string) => void;
  purchased: boolean;
  setPurchased: (value: boolean) => void;
  reserved: boolean;
  setReserved: (value: boolean) => void;
  setNextEvent: (value: string) => void;
  permission: string;
}


export const MainPage: React.FC<PageProps> = ({navigateToLoginPage}) => {
  const [username, setUsername] = useState<string>('');
  const [permission, setPermission] = useState<string>('');
  const [pageHeader, setPageHeader] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('main');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchased, setPurchased] = useState<boolean>(false);
  const [reserved, setReserved] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [nextEvent, setNextEvent] = useState<string>('');
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [ticketDetails, setTicketDetails] = useState<ticketDetails>();
  const [opened, { toggle }] = useDisclosure();
  const {setColorScheme} = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  }

  const fetchNextEvent = async (username: string) => {
    const res = await AuthApi.getNextEvent(username);
    if(res == ''){
      setNextEvent('');
      return;
    }
    if (!isAPIStatusEnum(res)) {
      const date = format(new Date(res.start_date), 'MMMM dd, yyyy, h:mm a');
      const title = res.title;
      setNextEvent(`${title} (${date})`);
    } else {
      setIsLoading(false);
      // setErrorMessage('Failed to fetch next upcoming event, please try again');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchUsername = async () => {
      const res = await AuthApi.getUserName();
      if (typeof res === 'string') {
        setUsername(res);
        fetchNextEvent(res);
        const permission = await AuthApi.getUserPermission(res);
        if(typeof permission === 'string'){
          setPermission(permission);
        }else{
          setIsLoading(false);
          setErrorMessage('Failed to fetch user permission, please try again');
        }
      } else {
        setIsLoading(false);
        setErrorMessage('Failed to fetch username, please try again');
      }
    };
    fetchUsername().then(() => {setIsLoading(false);});
  }, []);
  
  const onPersonalPage = () => {
    if(currentPage === 'main' || currentPage === 'backOffice' ){
      setCurrentPage('personal');
    }else{
      setCurrentPage('main');
    }
  }

  const onBackOffice = () => {
    if(currentPage === 'main' || currentPage === 'personal'){
      setCurrentPage('backOffice');
      return;
    }
    if(currentPage == 'backOffice'){
      setCurrentPage('main');
      return;
    }

  }

  const PageNav: Page = {
    setCurrentPage: (page: string) => setCurrentPage(page),
    setEventDetails: (eventDetails: any) => setEventDetails(eventDetails),
    eventDetails: eventDetails,
    setTicketDetails: setTicketDetails,
    ticketDetails: ticketDetails,
    username: username,
    orderId: orderId,
    setOrderId: setOrderId,
    purchased: purchased,
    setPurchased: setPurchased,
    reserved: reserved,
    setReserved: setReserved,
    setNextEvent: setNextEvent,
    permission: permission,
  }

  const onLogout = async () => {
    setIsLoading(true);
    const res = await AuthApi.logout();
    setIsLoading(false);
    if(res === APIStatus.Success) {
        navigateToLoginPage();
        return;
    }
    setErrorMessage('Failed to logout, please try again');
  }

  const renderPage = (page: string) => {
    switch(page){
      case 'AddEvent':
        return <AddNewEventPage {...PageNav}/>;
      case 'BOEvent':
        return <BOEventPage {...PageNav}/>;
      case 'backOffice':
        return <BOEventsCatalog {...PageNav}/>;
      case 'success':
        return <SuccessPage {...PageNav} />;
      case 'checkout':
        return <CheckoutPage {...PageNav}/>;
      case 'personal':
        return <PersonalPage {...PageNav} />;
      case 'event':
        return <EventPage {...PageNav}/>;
      default:
        return <EventsCatalog {...PageNav}/>
      
    }
  }

  const showGoBack = (page: string) => {
    if(page != 'main' && page != 'personal' && page != 'backOffice'){
      return true;
    }
    return false;
  }

  const showAddNewEvent = (page: string) => {
    if( page == 'backOffice' || page == 'BOEvent'){
      if(permission == 'A' || permission == 'M'){
        return true;
      }
    }
    return false;
  }

  const showNextEvent = (page: string) => {
    if(page != 'main' && page != 'personal'){
      return false;
    }
    return nextEvent != '';
  }

  const showNavBar = (page: string) => {
    if(page != 'main' && page != 'personal' && page != 'backOffice'){
      return false;
    }
    return true;
  }

  const handleGoBack = async () =>{
    switch(currentPage){
      case 'AddEvent':
        setCurrentPage('backOffice');
        return;
      case 'BOEvent':
        setCurrentPage('backOffice');
        return;
      case 'success':
        setPurchased(false);
        setReserved(false);
        fetchNextEvent(username);
        setCurrentPage('checkout');
        return;
      case 'checkout':
        if(reserved && !purchased){
          if(ticketDetails){
            let res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
            while(isAPIStatusEnum(res)){
              res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
            }
          }
        }
        setPurchased(false);
        setReserved(false);
        setCurrentPage('event');
        return;
      case 'event':
        setCurrentPage('main');
        return;
      default:
        setCurrentPage('main');
        return;
    }
  }

  const handleAddNewEvent = () => {
    setCurrentPage('AddEvent');
  }

  const UpdatePageHeader = () => {
    switch(currentPage){
      case 'AddEvent':
        return 'Add Event';
      case 'BOEvent':
        return 'BO Event Page';
      case 'backOffice':
        return 'BO Events Catalog';
      case 'personal':
        return 'Personal Page';
      case 'success':
        return 'Success Page';
      case 'checkout':
        return 'Checkout Page';
      case 'event':
        return 'Event Page';
      default:
        return 'Events Catalog';
    }
  }

  return (
    <div>
      {isLoading 
      ? <Loader /> 
      :  <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: !showNavBar(currentPage) ,mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex justify="space-between" align="center" style={{padding: '10px 20px'}}>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size="sm" />
          <Text size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
            {username}
          </Text>
          <Text size="lg" fw={900}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>{UpdatePageHeader()}</Text>
          <Flex justify="right" align="center" style={{gap: "10px"}}>
            {showNextEvent(currentPage) ? <Badge size='lg' color="green">Next Event: {nextEvent}</Badge> : null}
            {showAddNewEvent(currentPage) ? <Button onClick={() => handleAddNewEvent()} size='sm'>Add New Event</Button> : null}
            {showGoBack(currentPage) ? <Button onClick={() => handleGoBack()} size='sm'>Go Back</Button> : null}
          </Flex>
        </Flex>
      </AppShell.Header>
        <AppShell.Navbar  p="md" style={{gap:'10px'}}>
          {permission != 'U' ?<Button size='sm' onClick={onBackOffice}> {currentPage === "main" || currentPage === "personal" ? "back office" : "user interface"}</Button>: null}
          {currentPage != 'backOffice'?<Button size='sm' onClick={onPersonalPage}> {currentPage === 'main' || currentPage === 'backOffice' ? "personal page" : "events catalog"}</Button>:null}
          <Button size='sm' onClick={toggleColorScheme}>
            {computedColorScheme === 'dark' ? "light mode" : "dark mode"}
          </Button>
          <Button size='sm' onClick={onLogout}>Logout</Button> 
        </AppShell.Navbar>
      <AppShell.Main>
        {errorMessage && <ErrorMessage message={errorMessage}/>}
        {renderPage(currentPage)}
      </AppShell.Main>
    </AppShell>
      }
    </div>
  );
};
