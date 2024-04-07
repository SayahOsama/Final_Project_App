import React, { useEffect, useState } from 'react';
import { Page, isAPIStatusEnum } from '../main/main-page';
import { Button, Card, Flex, Text, Title } from '@mantine/core';
import validator from 'validator';
import './checkoutPage.css';
import { AuthApi } from '@/api/authApi';
import { Loader } from '../loader/loader';
import { format } from 'date-fns';
import { ErrorMessage } from '../error/error';

export const CheckoutPage:React.FC<Page> = ({username,ticketDetails,eventDetails,setOrderId,setCurrentPage,reserved,setReserved,purchased,setPurchased}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validCreditCard, setValidCreditCard] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validCVV, setValidCVV] = useState<boolean>(false);
  const [validExpDate, setValidExpDate] = useState<boolean>(false);
  const [validName, setValidName] = useState<boolean>(false);
  const [CCvalidatorErrorMessage, setCCValidatorErrorMessage] = useState<string>(''); 
  const [CVVvalidatorErrorMessage, setCVVValidatorErrorMessage] = useState<string>('');
  const [expDatevalidatorErrorMessage, setExpDateValidatorErrorMessage] = useState<string>(''); 
  const [namevalidatorErrorMessage, setNameValidatorErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    cvv: '',
    expDate: ''
  });

  useEffect(() => {
    if(purchased){
      return;
    }
    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      if(purchased){
        return;
      }else{
        if(ticketDetails){
          await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
        }
        setReserved(false);
      }
    },2 * 60 * 1000); // 2 minutes in milliseconds


    const reserveTickets = async () => {
      if(ticketDetails){
        const res = await AuthApi.updateTicketsAmount(eventDetails._id,-ticketDetails.amount,ticketDetails.ticketType);
        if(!isAPIStatusEnum(res)){
          setReserved(true);
        }else{
          setErrorMessage('Failed to lock the tickets, please try again');
        }
      }
    }

    reserveTickets().then(() => setIsLoading(false));

    // Cleanup function to clear the timeout when component unmounts or purchased changes
    return () => clearTimeout(timeoutId);
  }, [purchased]);


  useEffect(() => {
    const handleBeforeUnload = async (event:any) => {
      if (ticketDetails && reserved && !purchased) {
        let res = await AuthApi.updateTicketsAmount(eventDetails._id, ticketDetails.amount, ticketDetails.ticketType);
        while(isAPIStatusEnum(res)){
          res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [purchased,reserved]);

  const validateCreditCard = (value:string) => { 
    if (validator.isCreditCard(value)) { 
      setCCValidatorErrorMessage('Valid CreditCard Number') ;
      setValidCreditCard(true);
    } else { 
      setCCValidatorErrorMessage('Enter a valid CreditCard Number!') ;
      setValidCreditCard(false);
    } 
  }

  const validateExpirationDate = (expirationDate:string) => {
    // Expiration date should be in the format MM/YY or MM/YYYY
    const expirationDateRegex = /^(0[1-9]|1[0-2])\/(2[0-9]{3}|[0-9]{2})$/;
    if (!expirationDateRegex.test(expirationDate)) {
      setValidExpDate(false); // Invalid format
      setExpDateValidatorErrorMessage('Enter valid a Expiration Date');
      return;
    }
  
    // Extract month and year from the expiration date
    const [month, year] = expirationDate.split('/').map(part => parseInt(part, 10));
    const currentYear = new Date().getFullYear() % 100; // Get last two digits of the current year
  
    // Check if expiration date is in the future
    if (year < currentYear || (year === currentYear && month < new Date().getMonth() + 1)) {
      setValidExpDate(false); // Expiration date is in the past
      setExpDateValidatorErrorMessage('Enter valid a Expiration Date');
      return;
    }
  
    setValidExpDate(true); // Expiration date is valid
    setExpDateValidatorErrorMessage('Valid Expiration Date');
  }

  const validateCVV = (cvv:string) => {
    // CVV should be a string with 3 or 4 digits
    const cvvRegex = /^[0-9]{3}$/;
    setValidCVV(cvvRegex.test(cvv));
    if(cvvRegex){
      setCVVValidatorErrorMessage('Valid CVV');
    }else{
      setCVVValidatorErrorMessage('Enter a valid CVV!');
    }
    
  }

  
  function validateCardholderName(name: string) {
    // Check if the name contains only letters and spaces
    const regex = /^[a-zA-Z\s]+$/;
    setValidName(regex.test(name.trim()));
    if(regex.test(name.trim())){
      setNameValidatorErrorMessage('Valid Name');
    }else{
      setNameValidatorErrorMessage('Enter a valid Name!');
    }
  }

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if(name == 'cardNumber'){
      validateCreditCard(value);
    }else if(name == 'cvv'){
      validateCVV(value);
    }else if(name == 'expDate'){
      validateExpirationDate(value);
    }else if(name == 'name'){
      validateCardholderName(value);
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    if(!validCVV || !validCreditCard || !validExpDate || !validName){
      setErrorMessage('Failed to Submit Payment, one or more fields are invalid! please try again');
      return;
    }else{
      setIsLoading(true);
      if(reserved){
        if(ticketDetails){
          const payment = await AuthApi.createPayment(formData.cardNumber,formData.name,formData.cvv,formData.expDate,ticketDetails.amount*parseInt(ticketDetails.ticketPrice));
          if(!isAPIStatusEnum(payment)){
           const order = await AuthApi.createOrder(username,payment.data.paymentToken,eventDetails._id,ticketDetails.ticketType,ticketDetails.amount,eventDetails.start_date);
           if(!isAPIStatusEnum(order)){
            setPurchased(true);
            setOrderId(payment.data.paymentToken);
            setCurrentPage('success');
            setIsLoading(false);
            return;
           }else{
            setPurchased(false);
            setErrorMessage('Failed to create order, please try again');
            let refund = await AuthApi.refundPayment(payment.data.paymentToken);
            while(refund.status !== 200){
              refund = await AuthApi.refundPayment(payment.data.paymentToken);
            }
            setIsLoading(false);
            return;
           }
          }else{
            setPurchased(false);
            setErrorMessage('Failed to Submit Payment, please try again');
            setIsLoading(false);
            return;
          }
        }
      }else{
        if(ticketDetails){
          const res = await AuthApi.updateTicketsAmount(eventDetails._id,-ticketDetails.amount,ticketDetails.ticketType);
          if(!isAPIStatusEnum(res)){
            const payment = await AuthApi.createPayment(formData.cardNumber,formData.name,formData.cvv,formData.expDate,ticketDetails.amount*parseInt(ticketDetails.ticketPrice));
            if(!isAPIStatusEnum(payment)){
              const order = await AuthApi.createOrder(username,payment.data.paymentToken,eventDetails._id,ticketDetails.ticketType,ticketDetails.amount,eventDetails.start_date);
              if(!isAPIStatusEnum(order)){
                setPurchased(true);
                setOrderId(payment.data.paymentToken);
                setCurrentPage('success');
                setIsLoading(false);
                return;
              }else{
                setPurchased(false);
                setErrorMessage('Failed to create order, please try again');
                let res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
                while(isAPIStatusEnum(res)){
                  res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
                }
                let refund = await AuthApi.refundPayment(payment.data.paymentToken);
                while(refund.status !== 200){
                  refund = await AuthApi.refundPayment(payment.data.paymentToken);
                }
                setIsLoading(false);
                return;
              }
            }else{
              setPurchased(false);
              setErrorMessage('Failed to Submit Payment, please try again');
              let res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
              while(isAPIStatusEnum(res)){
                res = await AuthApi.updateTicketsAmount(eventDetails._id,ticketDetails.amount,ticketDetails.ticketType);
              }
              setIsLoading(false);
              return;
            }
          }else{
            setPurchased(false);
            setErrorMessage('Failed to get the tickets, please try again');
            setIsLoading(false);
            return;
          }
        }
      }
    }
  };

  return (
    <div>
      {isLoading 
      ? <Loader /> 
      :
      <Flex align="center" direction="column">
        <Card style={{width: 'fit-content'}} shadow="lg" p="md" radius="md" component="a">
          <Flex justify="flex-start" align="center" direction="column">
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
          </Flex>
        </Card>
        {errorMessage && <ErrorMessage message={errorMessage}/>}
        <Card style={{width: 'fit-content', marginTop: '10px'}} shadow="lg" p="md" radius="md" component="a">
          <Flex justify="flex-start" align="center" direction="column">
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <span style={{ 
                  fontWeight: 'bold', 
                  color: validName ? 'green' : 'red', 
                }}>{namevalidatorErrorMessage}</span>
              </div>
              <div>
                <label htmlFor="cardNumber">Credit Card Number:</label>
                <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required />
                <span style={{ 
                  fontWeight: 'bold', 
                  color: validCreditCard ? 'green' : 'red', 
                }}>{CCvalidatorErrorMessage}</span>
              </div>
              <div>
                <label htmlFor="cvv">CVV:</label>
                <input type="text" id="cvv" name="cvv" value={formData.cvv} onChange={handleChange} required />
                <span style={{ 
                  fontWeight: 'bold', 
                  color: validCVV ? 'green' : 'red', 
                }}>{CVVvalidatorErrorMessage}</span>
              </div>
              <div>
                <label htmlFor="expDate">Expiration Date:</label>
                <input placeholder="MM/YY" type="text" id="expDate" name="expDate" value={formData.expDate} onChange={handleChange} required />
                <span style={{ 
                  fontWeight: 'bold', 
                  color: validExpDate ? 'green' : 'red', 
                }}>{expDatevalidatorErrorMessage}</span>
              </div>
              <Button type='submit' size="compact-sm" variant="filled" style={{marginTop: '5px'}} >Submit Payment</Button>
            </form>
          </Flex>
        </Card> 
      </Flex> 
    }
    </div>
  )
}
